import dotenv from "dotenv/config";
dotenv.config;
import express from "express";
import multer from "multer";
import cors from "cors";
import mongoose from "mongoose";
import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from "./valigations.js";
import checkAuth from "./utils/checkAuth.js";

import { UserController, PostController } from "./controllers/index.js";
import handleValidationErrors from "./utils/handleValidationErrors.js";

mongoose
  .connect(process.env.DB_CONECT)
  .then(() => {
    console.log("DB Ok");
  })
  .catch((err) => {
    console.log("DB error", err);
  });

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login,
);
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register,
);
app.get("/auth/me", checkAuth, UserController.getMe);

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get("/posts", PostController.getAll);
app.get("/tags", PostController.getLastTags);
app.get("/posts/:id", PostController.getOne);
app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create,
);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
);

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("server OK");
});
