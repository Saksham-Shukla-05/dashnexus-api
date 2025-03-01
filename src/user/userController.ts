import { NextFunction, Response, Request } from "express";
import createHttpError from "http-errors";
import { body, validationResult } from "express-validator";

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

  res.json({
    message: "User Created",
  });
};

export { createUser, validateUser };
