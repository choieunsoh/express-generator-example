const express = require("express");
const bodyParser = require("body-parser");

const promotionRouter = express.Router();
promotionRouter.use(bodyParser.json());

promotionRouter
  .route("/")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .get((req, res, next) => {
    res.end("Will send all the promotions to you.");
  })
  .post((req, res, next) => {
    res.end(
      `Will add the promotion: ${req.body.name} with details: ${req.body.description}.`
    );
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT Not supported.`);
  })
  .delete((req, res, next) => {
    res.statusCode = 403;
    res.end(`DELETE Not supported.`);
  });

promotionRouter
  .route("/:promoId")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .get((req, res, next) => {
    res.end(`Will send the details of promotion ${req.params.promoId} to you.`);
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end(`POST Not supported.`);
  })
  .put((req, res, next) => {
    res.end(
      `Will update the promotion: ${req.params.promoId}, ${req.body.name} with details: ${req.body.description}.`
    );
  })
  .delete((req, res, next) => {
    res.end(
      `Will delete the promotion: ${req.params.promoId}, ${req.body.name}.`
    );
  });

module.exports = promotionRouter;
