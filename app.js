require("./config/mongoose");
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const passportAuthentication = require("./config/passport");

const indexRouter = require("./app/routes/index");
const authRouter = require("./app/routes/auth");
const usersRouter = require("./app/routes/user");
const postRouter = require("./app/routes/post");
const oauthRouter = require("./app/routes/oauth");
const calendarRoute = require("./app/routes/calendar");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/user", usersRouter);
app.use("/post", postRouter);
app.use("/oauth", oauthRouter);
app.use("/calendar", calendarRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, "route doesn't exist"));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
