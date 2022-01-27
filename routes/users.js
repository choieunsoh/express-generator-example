const express = require("express");
const bodyParser = require("body-parser");
const Users = require("../models/users");

const router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", (req, res, next) => {
  const { username, password } = req.body;
  Users.findOne({ username })
    .then((user) => {
      if (user !== null) {
        let err = new Error(`User ${username} already exists.`);
        err.status = 403;
        return next(err);
      } else {
        return Users.create({ username, password });
      }
    })
    .then(
      (user) => {
        user.password = "";
        res.status(201);
        res.setHeader("Content-Type", "application/json");
        res.json({ status: "Registration successful.", user });
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});

router.post("/login", (req, res, next) => {
  const sessionUser = req.session.user;
  if (!sessionUser) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      let err = new Error("You are not authenticated!");
      err.status = 401;
      res.setHeader("WWW-Authenticate", "Basic");
      next(err);
    } else {
      const [username, password] = Buffer.from(
        authHeader.split(" ")[1],
        "base64"
      )
        .toString()
        .split(":");

      Users.findOne({ username, password })
        .then(
          (user) => {
            if (user === null) {
              let err = new Error(`Username or password is incorrect.`);
              err.status = 403;
              return next(err);
            } else {
              req.session.user = "authenticated";
              res.status(200);
              res.setHeader("Content-Type", "text/plain");
              res.end("You are now authenticated.");
            }
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  } else {
    res.status(200);
    res.setHeader("Content-Type", "text/plain");
    res.end("You are already authenticated.");
  }
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
