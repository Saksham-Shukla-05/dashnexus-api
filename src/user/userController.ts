import { NextFunction, Response, Request } from "express";
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "user Created",
  });
};

export { createUser };
