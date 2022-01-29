const express = require("express");
const bodyParser = require("body-parser");
const Leaders = require("../models/leaders");
const { verifyUser, verifyAdmin } = require("../authenticate");
const { cors, corsWithOptions } = require("./cors");

const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());

leaderRouter
  .route("/")
  .options(corsWithOptions, (req, res) => {
    res.status(200);
  })
  .get(cors, (req, res, next) => {
    Leaders.find({})
      .then(
        (leaders) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(leaders);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .post(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
    Leaders.create(req.body)
      .then(
        (leader) => {
          console.log("Leader created", leader);
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.json(leader);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .put(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT Not supported.`);
  })
  .delete(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
    Leaders.deleteMany({})
      .then(
        (result) => {
          console.log("Leaders deleted", result);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(result);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  });

leaderRouter
  .route("/:leaderId")
  .options(corsWithOptions, (req, res) => {
    res.status(200);
  })
  .get(cors, (req, res, next) => {
    Leaders.findById(req.params.leaderId)
      .then(
        (leader) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(leader);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .post(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST Not supported.`);
  })
  .put(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
    Leaders.findByIdAndUpdate(
      req.params.leaderId,
      { $set: req.body },
      { new: true }
    )
      .then(
        (leader) => {
          console.log("Leader updated", leader);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(leader);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .delete(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
    Leaders.findByIdAndDelete(req.params.leaderId)
      .then(
        (result) => {
          console.log("Leader deleted", result);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(result);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  });

module.exports = leaderRouter;
