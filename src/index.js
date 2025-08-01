import express from "express";
const app = express();
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to codeitout");
});

app.use("/api/v1/auth", authRoutes);

app.listen(port, () => {
  console.log(`serving on port: ${port}`);
});
