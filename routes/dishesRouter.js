const express = require("express");
const bodyParser = require("body-parser");
const Dishes = require("../models/dishes");
const { verifyUser, verifyAdmin } = require("../authenticate");

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

dishRouter
  .route("/")
  .get((req, res, next) => {
    Dishes.find({})
      .populate("comments.author")
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
  .post(verifyUser, verifyAdmin, (req, res, next) => {
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
  .put(verifyUser, verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT Not supported.`);
  })
  .delete(verifyUser, verifyAdmin, (req, res, next) => {
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
      .populate("comments.author")
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
  .post(verifyUser, verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST Not supported.`);
  })
  .put(verifyUser, verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndUpdate(
      req.params.dishId,
      { $set: req.body },
      { new: true }
    )
      .then(
        (dish) => {
          Dishes.findById(dish._id)
            .populate("comments.author")
            .then(
              (dish) => {
                console.log("Dish updated", dish);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              (err) => next(err)
            );
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .delete(verifyUser, verifyAdmin, (req, res, next) => {
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
      .populate("comments.author")
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
  .post(verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish !== null) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save().then(
              (dish) => {
                Dishes.findById(dish._id)
                  .populate("comments.author")
                  .then((dish) => {
                    res.statusCode = 201;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                  });
              },
              (err) => next(err)
            );
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
  .put(verifyUser, verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT Not supported.`);
  })
  .delete(verifyUser, verifyAdmin, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish !== null) {
            for (let i = dish.comments.length - 1; i >= 0; i--) {
              dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save().then((dish) => {
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
      .populate("comments.author")
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
  .post(verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST Not supported.`);
  })
  .put(verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish !== null) {
            const theComment = dish.comments.id(req.params.commentId);
            if (theComment !== null) {
              if (theComment.author.valueOf() !== req.user._id.valueOf()) {
                let err = new Error(
                  `The comment cannot be edited except by the user who created the comment.`
                );
                err.status = 401;
                return next(err);
              }

              const { rating, comment } = req.body;
              if (rating !== null) {
                theComment.rating = rating;
              }
              if (comment !== null) {
                theComment.comment = comment;
              }
              dish.save().then((dish) => {
                Dishes.findById(dish._id)
                  .populate("comments.author")
                  .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                  });
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
  .delete(verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish !== null) {
            const theComment = dish.comments.id(req.params.commentId);
            if (theComment !== null) {
              if (theComment.author.valueOf() !== req.user._id.valueOf()) {
                let err = new Error(
                  `The comment cannot be deleted except by the user who created the comment.`
                );
                err.status = 401;
                return next(err);
              }

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
