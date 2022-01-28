const express = require("express");
const bodyParser = require("body-parser");
const Users = require("../models/users");
const passport = require("passport");

const router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", (req, res, next) => {
  const { username, password } = req.body;
  Users.register(new Users({ username }), password, (err, user) => {
    if (err) {
      res.status(201);
      res.setHeader("Content-Type", "application/json");
      res.json({ err });
    } else {
      passport.authenticate("local")(req, res, () => {
        res.status(201);
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, status: "Registration successful.", user });
      });
    }
  });
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.status(200);
  res.setHeader("Content-Type", "application/json");
  res.json({ success: true, status: "You are successfully logged in." });
});

router.get("/logout", (req, res, next) => {
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

module.exports = router;
