const express = require("express");
const bodyParser = require("body-parser");
const Promotions = require("../models/promotions");
const { verifyUser, verifyAdmin } = require("../authenticate");
const { cors, corsWithOptions } = require("./cors");

const promotionRouter = express.Router();
promotionRouter.use(bodyParser.json());

promotionRouter
  .route("/")
  .options(corsWithOptions, (req, res) => {
    res.status(200);
  })
  .get(cors, (req, res, next) => {
    Promotions.find({})
      .then(
        (promotions) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotions);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .post(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
    Promotions.create(req.body)
      .then(
        (promotion) => {
          console.log("Promotion created", promotion);
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.json(promotion);
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
    Promotions.deleteMany({})
      .then(
        (result) => {
          console.log("Promotions deleted", result);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(result);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  });

promotionRouter
  .route("/:promoId")
  .options(corsWithOptions, (req, res) => {
    res.status(200);
  })
  .get(cors, (req, res, next) => {
    Promotions.findById(req.params.promoId)
      .then(
        (promotion) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotion);
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
    Promotions.findByIdAndUpdate(
      req.params.promoId,
      { $seet: req.body },
      { new: true }
    )
      .then(
        (promotion) => {
          console.log("Promotion updated", promotion);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotion);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .delete(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndDelete(req.params.promoId)
      .then(
        (result) => {
          console.log("Promotion deleted", result);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(result);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  });

module.exports = promotionRouter;
