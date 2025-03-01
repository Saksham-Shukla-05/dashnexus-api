import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.json({
    Message: "Welcome to the application",
  });
});

export default app;
