import express from "express";
import globalErrorHandler from "./MiddleWares/globalErrorHandler";

const app = express();

app.get("/", (req, res) => {
  res.json({
    Message: "Welcome to the application",
  });
});

//global error handler (Should be written at last after all the routes)
app.use(globalErrorHandler);
export default app;
