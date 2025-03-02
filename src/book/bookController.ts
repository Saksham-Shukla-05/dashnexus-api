import { NextFunction, Response, Request } from "express";
import cloudinary from "../config/cloudinary";
import path from "path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import { AuthRequest } from "../MiddleWares/authenticate";
import fs from "fs";
const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const files = req.files as { [filename: string]: Express.Multer.File[] };
  const { title, genre } = req.body;
  const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
  const fileName = files.coverImage[0].filename;
  const filePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    fileName
  );
  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
      format: coverImageMimeType,
    });

    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );

    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      }
    );

    const _req = req as AuthRequest;
    const newBook = await bookModel.create({
      title,
      genre,
      author: _req.userId,
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    //delete temp files

    await fs.promises.unlink(filePath);
    await fs.promises.unlink(bookFilePath);

    res.status(201).json({
      id: newBook._id,
    });
  } catch (error) {
    return next(
      createHttpError(500, "Something went wrong while uploading files")
    );
  }
};

export { createBook };
