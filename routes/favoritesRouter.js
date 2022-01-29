const express = require("express");
const bodyParser = require("body-parser");
const Favorites = require("../models/favorites");
const { verifyUser, verifyAdmin } = require("../authenticate");
const { cors, corsWithOptions } = require("./cors");

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(corsWithOptions, (req, res) => {
    res.status(200);
  })
  .get(corsWithOptions, verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate("user dishes")
      .then(
        (favorite) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .post(corsWithOptions, verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorite) => {
          if (favorite === null) {
            favorite = new Favorites({ user: req.user._id });
          }

          // Check dish not exists
          const dishIds = favorite.dishes.map((dish) => dish._id.toString());
          for (let dish of req.body) {
            if (dishIds.includes(dish._id) === false) {
              // Add new favorite dish
              favorite.dishes.push(dish._id);
            }
          }

          // Save
          favorite.save().then(
            (favorite) => {
              console.log("favorite dishes created", favorite);
              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            },
            (err) => next(err)
          );
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .put(corsWithOptions, verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT Not supported.`);
  })
  .delete(corsWithOptions, verifyUser, (req, res, next) => {
    Favorites.findOneAndDeletee({ user: req.user._id })
      .then(
        (result) => {
          console.log("Favorite dishes deleted", result);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(result);
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  });

favoriteRouter
  .route("/:dishId")
  .options(corsWithOptions, (req, res) => {
    res.status(200);
  })
  .get(corsWithOptions, verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET Not supported.`);
  })
  .post(corsWithOptions, verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorite) => {
          if (favorite === null) {
            favorite = new Favorites({ user: req.user._id });
          }

          // Check dish not exists
          const theDish = favorite.dishes.find(
            (dish) => dish._id.toString() === req.params.dishId
          );
          if (!theDish) {
            // Add new favorite dish
            favorite.dishes.push(req.params.dishId);
          }

          // Save
          favorite.save().then(
            (favorite) => {
              console.log("Favorite dish created", favorite);
              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            },
            (err) => next(err)
          );
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  })
  .put(corsWithOptions, verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT Not supported.`);
  })
  .delete(corsWithOptions, verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorite) => {
          if (favorite) {
            favorite.dishes.pull(req.params.dishId);
            favorite.save().then(
              (result) => {
                console.log("Favorite dish deleted", result);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(result);
              },
              (error) => next(err)
            );
          } else {
            let err = new Error("No favorite list.");
            err.status = 403;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((error) => next(error));
  });

module.exports = favoriteRouter;
