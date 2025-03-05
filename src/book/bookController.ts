import { NextFunction, Response, Request } from "express";
import cloudinary from "../config/cloudinary";
import path from "path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import { AuthRequest } from "../MiddleWares/authenticate";
import fs from "fs";
const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const files = req.files as { [filename: string]: Express.Multer.File[] };
  const { title, genre, description } = req.body;
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
      description,
      author: _req.userId,
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    //delete temp files

    await fs.promises.unlink(filePath);
    await fs.promises.unlink(bookFilePath);

    res.status(201).json({
      id: newBook._id,
      message: "Book Created Successfully",
    });
  } catch (error) {
    return next(
      createHttpError(500, "Something went wrong while uploading files")
    );
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre, description } = req.body;
  const bookId = req.params.bookId;

  try {
    const book = await bookModel.findOne({ _id: bookId });

    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    const _req = req as AuthRequest;
    if (book.author.toString() != _req.userId) {
      return next(createHttpError(403, "Unauthorized"));
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let completeCoverImage = "";
    if (files.coverImage) {
      const filename = files.coverImage[0].filename;
      const converMimeType = files.coverImage[0].mimetype.split("/").at(-1);

      const filePath = path.resolve(
        __dirname,
        "../../public/data/uploads/" + filename
      );
      completeCoverImage = filename;
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        filename_override: completeCoverImage,
        folder: "book-covers",
        format: converMimeType,
      });

      completeCoverImage = uploadResult.secure_url;
      await fs.promises.unlink(filePath);
    }

    let completeFileName = "";
    if (files.file) {
      const bookFilePath = path.resolve(
        __dirname,
        "../../public/data/uploads/" + files.file[0].filename
      );

      const bookFileName = files.file[0].filename;
      completeFileName = bookFileName;

      const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
        resource_type: "raw",
        filename_override: completeFileName,
        folder: "book-pdfs",
        format: "pdf",
      });

      completeFileName = uploadResultPdf.secure_url;
      await fs.promises.unlink(bookFilePath);
    }

    const updatedBook = await bookModel.findOneAndUpdate(
      {
        _id: bookId,
      },
      {
        title: title,
        description: description,
        genre: genre,
        coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
        file: completeFileName ? completeFileName : book.file,
      },
      { new: true }
    );

    res.json({
      updatedBook: updatedBook,
      message: `${title} has been updated successfully`,
    });
  } catch (error) {
    return next(createHttpError(500, "An error occured while updating book "));
  }
};

const getBook = async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const skip = (page - 1) * limit;

  try {
    const book = await bookModel
      .find()
      .populate("author", "-password")
      .skip(skip)
      .limit(limit);

    const totalBooks = await bookModel.countDocuments();

    res.json({
      book,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: page,
    });
  } catch (error) {
    return next(createHttpError(500, "An error occurred while getting books"));
  }
};

const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookId = req.params.bookId;
  try {
    const book = await bookModel.findOne({ _id: bookId });

    if (!book) {
      return next(createHttpError(500, "Book does not exist "));
    }

    console.log("Books", book);

    res.json(book);
  } catch (error) {
    return next(createHttpError(500, "An error occured while getting book"));
  }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.bookId;

  try {
    const book = await bookModel.findOne({ _id: bookId });

    if (!book) {
      return next(createHttpError(500, "Book does not exist "));
    }

    //check access
    const _req = req as AuthRequest;
    if (book.author.toString() != _req.userId) {
      return next(createHttpError(403, "Unauthorized"));
    }

    const coverFileSplits = book.coverImage.split("/");
    const coverImagePublicId =
      coverFileSplits.at(-2) + "/" + coverFileSplits.at(-1)?.split(".").at(-2);

    const bookFileSplits = book.file.split("/");
    const bookFilePublicId =
      bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);

    console.log(bookFilePublicId);

    await cloudinary.uploader.destroy(coverImagePublicId);

    await cloudinary.uploader.destroy(bookFilePublicId, {
      resource_type: "raw",
    });

    await bookModel.deleteOne({ _id: bookId });

    res.json({ Book: book.title, BookAuthor: book.author });
  } catch (error) {
    return next(createHttpError(500, "An error occured while deleting book"));
  }
};
export { createBook, updateBook, getBook, getSingleBook, deleteBook };
