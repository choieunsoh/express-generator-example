const express = require("express");
const bodyParser = require("body-parser");
const Users = require("../models/users");
const passport = require("passport");
const { getToken, verifyUser, verifyAdmin } = require("../authenticate");
const { cors, corsWithOptions } = require("./cors");
const { authenticate } = require("passport");

const router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get("/", corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
  Users.find({})
    .then(
      (users) => {
        res.status(200);
        res.setHeader("Content-Type", "application/json");
        res.json(users);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});

router.post("/signup", corsWithOptions, (req, res, next) => {
  const { username, password, firstName, lastName } = req.body;
  Users.register(new Users({ username }), password, (err, user) => {
    if (err) {
      res.status(201);
      res.setHeader("Content-Type", "application/json");
      res.json({ err });
    } else {
      user.firstName = firstName || "";
      user.lastName = lastName || "";
      user
        .save()
        .then(
          (user) => {
            passport.authenticate("local")(req, res, () => {
              res.status(201);
              res.setHeader("Content-Type", "application/json");
              res.json({
                success: true,
                status: "Registration successful.",
                user,
              });
            });
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  });
});

router.post(
  "/login",
  corsWithOptions,
  passport.authenticate("local"),
  (req, res) => {
    const { _id } = req.user;
    const token = getToken({ _id });
    res.status(200);
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: true,
      token,
      status: "You are successfully logged in.",
    });
  }
);

router.get("/logout", corsWithOptions, (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
  } else {
    let err = new Error("You are not logged in!");
    err.status = 403;
    return next(err);
  }
});

router.get(
  "/facebook/token",
  passport.authenticate("facebook-token"),
  (req, res) => {
    if (req.user) {
      const token = getToken({ _id: req.user._id });
      res.status(200);
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        token,
        status: "You are successfully logged in.",
      });
    }
  }
);

module.exports = router;
