import express from "express";
import { createUser, validateUser } from "./userController";

const userRouter = express.Router();

userRouter.post("/register", validateUser, createUser);

export default userRouter;
