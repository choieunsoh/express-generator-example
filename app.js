const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const dishesRouter = require("./routes/dishesRouter");
const promotionsRouter = require("./routes/promotionsRouter");
const leadersRouter = require("./routes/leadersRouter");

require("dotenv").config();
const mongoose = require("mongoose");
const url = process.env.MONGO_DB;
mongoose
  .connect(url)
  .then((db) => {
    console.log("Connected correctly to server.");
  })
  .catch((err) => {
    console.error(err);
  });

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("12345-67890-09876-54321"));

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

    console.log(username, password);
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

      console.log(username, password);
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
// Cookie + Basic Auth
app.use(cookieBasicAuthen);

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/dishes", dishesRouter);
app.use("/promotions", promotionsRouter);
app.use("/leaders", leadersRouter);

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
