require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const usersRouter = require("./routes/users");
const blogRouter = require("./routes/blogs");
const { connectToDb } = require("./common/dbconfig");
const app = express();

app.disable("x-powered-by");
app.use(helmet());

app.use(
  cors({
    origin: ["https://bloghub20.netlify.app", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/users", usersRouter);
app.use("/blogs", blogRouter);

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.send(err);
});

(async () => {
  try {
    await connectToDb();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
})();

module.exports = app;
