const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const passport = require("passport");
const authenticate = require("./authenticate");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const dishesRouter = require("./routes/dishesRouter");
const promotionsRouter = require("./routes/promotionsRouter");
const leadersRouter = require("./routes/leadersRouter");
const uploadRouter = require("./routes/uploadRouter");

require("dotenv").config();
const { MONGO_DB } = process.env;

const mongoose = require("mongoose");
mongoose
  .connect(MONGO_DB)
  .then((db) => {
    console.log("Connected correctly to server.");
  })
  .catch((err) => {
    console.error(err);
  });

const app = express();
app.all("*", (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
    res.redirect(
      307,
      `https://${req.hostname}:${app.get("secPort")}${req.url}`
    );
  }
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser("12345-67890-09876-54321"));
/*app.use(
  session({
    name: "session-id",
    secret: "12345-67890-09876-54321",
    saveUninitialized: false,
    resave: false,
    store: new FileStore(),
  })
);*/

app.use(passport.initialize());
//app.use(passport.session());

app.use("/", indexRouter);
app.use("/users", usersRouter);

const basicAuthen = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    let err = new Error("You are not authenticated!");
    err.status = 401;
    res.setHeader("WWW-Authenticate", "Basic");
    next(err);
  } else {
    const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64")
      .toString()
      .split(":");

    if (username === "admin" && password === "password") {
      next();
    } else {
      let err = new Error("You are not authenticated!");
      err.status = 401;
      res.setHeader("WWW-Authenticate", "Basic");
      next(err);
    }
  }
};

const cookieBasicAuthen = (req, res, next) => {
  const cookieUser = req.signedCookies.user;
  if (!cookieUser) {
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

      if (username === "admin" && password === "password") {
        res.cookie("user", "admin", { signed: true });
        next();
      } else {
        let err = new Error("You are not authenticated!");
        err.status = 401;
        res.setHeader("WWW-Authenticate", "Basic");
        next(err);
      }
    }
  } else if (cookieUser === "admin") {
    next();
  } else {
    let err = new Error("You are not authenticated!");
    err.status = 401;
    res.setHeader("WWW-Authenticate", "Basic");
    next(err);
  }
};

const sessionAuthen = (req, res, next) => {
  const sessionUser = req.session.user;
  if (!sessionUser) {
    let err = new Error("You are not authenticated!");
    err.status = 401;
    res.setHeader("WWW-Authenticate", "Basic");
    next(err);
  } else if (sessionUser === "authenticated") {
    next();
  } else {
    let err = new Error("You are not authenticated!");
    err.status = 401;
    res.setHeader("WWW-Authenticate", "Basic");
    next(err);
  }
};

const passportAuthen = (req, res, next) => {
  if (!req.user) {
    let err = new Error("You are not authenticated!");
    err.status = 401;
    res.setHeader("WWW-Authenticate", "Basic");
    next(err);
  } else {
    next();
  }
};

app.use(express.static(path.join(__dirname, "public")));

app.use("/dishes", dishesRouter);
app.use("/promotions", promotionsRouter);
app.use("/leaders", leadersRouter);
app.use("/imageUpload", uploadRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
