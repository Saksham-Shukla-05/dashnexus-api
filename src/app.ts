import express from "express";
import globalErrorHandler from "./MiddleWares/globalErrorHandler";
import userRouter from "./user/userRouter";
import cors from "cors";
import bookRouter from "./book/bookRouter";
// import { config } from "./config/config";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.get("/", (req, res) => {
  res.json({
    Message: "Welcome to the application",
  });
});

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

//global error handler (Should be written at last after all the routes)
app.use(globalErrorHandler);
export default app;
