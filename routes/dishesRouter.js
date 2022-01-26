const express = require("express");
const bodyParser = require("body-parser");
const Dishes = require("../models/dishes");

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

dishRouter
  .route("/")
  .get((req, res, next) => {
    Dishes.find({})
      .then(
        (dishes) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dishes);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .post((req, res, next) => {
    Dishes.create(req.body)
      .then(
        (dish) => {
          console.log("Dish created", dish);
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT Not supported.`);
  })
  .delete((req, res, next) => {
    Dishes.deleteMany({})
      .then(
        (result) => {
          console.log("Dishes deleted", result);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(result);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  });

dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end(`POST Not supported.`);
  })
  .put((req, res, next) => {
    Dishes.findByIdAndUpdate(
      req.params.dishId,
      { $set: req.body },
      { new: true }
    )
      .then(
        (dish) => {
          console.log("Dish updated", dish);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .delete((req, res, next) => {
    Dishes.findByIdAndDelete(req.params.dishId)
      .then(
        (result) => {
          console.log("Dish deleted", result);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(result);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  });

dishRouter
  .route("/:dishId/comments")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish !== null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments);
          } else {
            let err = new Error(`Dish ${req.params.dishId} not found.`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .post((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish !== null) {
            dish.comments.push(req.body);
            dish.save().then((result) => {
              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.json(dish);
            });
          } else {
            let err = new Error(`Dish ${req.params.dishId} not found.`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT Not supported.`);
  })
  .delete((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish !== null) {
            for (let i = dish.comments.length - 1; i >= 0; i--) {
              dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save().then((result) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(dish);
            });
          } else {
            let err = new Error(`Dish ${req.params.dishId} not found.`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  });

dishRouter
  .route("/:dishId/comments/:commentId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish !== null) {
            const comment = dish.comments.id(req.params.commentId);
            if (comment !== null) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(comment);
            } else {
              let err = new Error(`Comment ${req.params.commentId} not found.`);
              err.status = 404;
              return next(err);
            }
          } else {
            let err = new Error(`Dish ${req.params.dishId} not found.`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end(`POST Not supported.`);
  })
  .put((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish !== null) {
            const theComment = dish.comments.id(req.params.commentId);
            if (theComment !== null) {
              const { rating, comment } = req.body;
              if (rating !== null) {
                theComment.rating = rating;
              }
              if (comment !== null) {
                theComment.comment = comment;
              }
              dish.save().then((result) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              });
            } else {
              let err = new Error(`Comment ${req.params.commentId} not found.`);
              err.status = 404;
              return next(err);
            }
          } else {
            let err = new Error(`Dish ${req.params.dishId} not found.`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .delete((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish !== null) {
            if (dish.comments.id(req.params.commentId) !== null) {
              dish.comments.id(req.params.commentId).remove();
              dish.save().then((result) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              });
            } else {
              let err = new Error(`Comment ${req.params.commentId} not found.`);
              err.status = 404;
              return next(err);
            }
          } else {
            let err = new Error(`Dish ${req.params.dishId} not found.`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  });

module.exports = dishRouter;
