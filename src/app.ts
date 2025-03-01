import express from "express";
const app = express();

app.get("/", (req, res, next) => {
  res.json({
    Message: "Welcome to the application",
  });
});

export default app;
