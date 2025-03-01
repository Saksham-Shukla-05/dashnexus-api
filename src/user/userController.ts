import { NextFunction, Response, Request } from "express";
import createHttpError from "http-errors";
import { body, validationResult } from "express-validator";
import userModel from "./userModel";

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

  res.json({
    message: "User Created",
  });
};

export { createUser, validateUser };
