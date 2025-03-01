import express from "express";
import { createUser, loginUser, validateUser } from "./userController";

const userRouter = express.Router();

userRouter.post("/register", validateUser, createUser);
userRouter.post("/login", loginUser);

export default userRouter;
