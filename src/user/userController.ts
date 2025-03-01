import { NextFunction, Response, Request } from "express";
import createHttpError from "http-errors";
import { body, validationResult } from "express-validator";
import userModel from "./userModel";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

// Validation
const validateUser = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  const { password } = req.body;

  if (!errors.isEmpty()) {
    return next(
      createHttpError(400, {
        message: errors.array().map((err) => err.msg),
      })
    );
  }

  // Database call.
  const user = await userModel.findOne({ email: req.body.email });

  if (user) {
    const error = createHttpError(
      400,
      "User Already exisit with the provided email "
    );
    return next(error);
  }

  // process (adding user in the db , hashing passowrd)

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await userModel.create({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });

  // Token Generation

  const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
    expiresIn: "7d",
  });

  res.json({
    accessToken: token,
  });
};

export { createUser, validateUser };
