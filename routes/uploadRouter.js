const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/images");
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});
const { cors, corsWithOptions } = require("./cors");

const fileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error("You can upload only image files."), false);
  } else {
    return callback(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

const { verifyUser, verifyAdmin } = require("../authenticate");

const uploadRouter = express.Router();
uploadRouter.use(bodyParser.json());

uploadRouter
  .route("/")
  .options(corsWithOptions, (req, res) => {
    res.status(200);
  })
  .get(cors, verifyUser, verifyAdmin, (req, res, next) => {
    res.status(403);
    res.setHeader("Content-Type", "text/plain");
    res.end("GET not supported.");
  })
  .post(
    corsWithOptions,
    verifyUser,
    verifyAdmin,
    upload.single("imageFile"),
    (req, res, next) => {
      res.status(200);
      res.setHeader("Content-Type", "application/json");
      res.json(req.file);
    }
  )
  .put(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
    res.status(403);
    res.setHeader("Content-Type", "text/plain");
    res.end("PUT not supported.");
  })
  .delete(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
    res.status(403);
    res.setHeader("Content-Type", "text/plain");
    res.end("DELETE not supported.");
  });

module.exports = uploadRouter;
