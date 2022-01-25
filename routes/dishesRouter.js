const express = require("express");
const bodyParser = require("body-parser");

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

dishRouter
  .route("/")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .get((req, res, next) => {
    res.end("Will send all the dishes to you.");
  })
  .post((req, res, next) => {
    res.end(
      `Will add the dish: ${req.body.name} with details: ${req.body.description}.`
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

dishRouter
  .route("/:dishId")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .get((req, res, next) => {
    res.end(`Will send the details of dish: ${req.params.dishId} to you.`);
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end(`POST Not supported.`);
  })
  .put((req, res, next) => {
    res.end(
      `Will update the dish: ${req.body.dishId}, ${req.body.name} with details: ${req.body.description}.`
    );
  })
  .delete((req, res, next) => {
    res.end(`Will delete the dish: ${req.body.dishId}.`);
  });

module.exports = dishRouter;
