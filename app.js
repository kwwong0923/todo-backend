// ---------- Init ----------
// Environment variable: using .env
require("dotenv").config();
// Express Async Errors Handling
require("express-async-errors");

// ---------- Imports ----------
// Express
const express = require("express");
const app = express();

// ---------- Third Party Modules ----------
// Logger: display log on the console
const morgan = require("morgan");

// Cookie
const cookieParser = require("cookie-parser");

// Uploading File
// Local uploader
const fileUpload = require("express-fileupload");
// Cloudinary (Cloud uploader)
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Passport
const passport = require("passport");
// passport needs express-session
const session = require("express-session");

// Security Packages
// Cors
const cors = require("cors");
// limit the amount of requests from same IP
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

// ---------- Own Modules ----------
// Database
const connectDB = require("./db/connect");

// Router
const { authRouter, userRouter, taskRouter } = require("./routes");
// Error Handler
const { notFoundMiddleware, errorHandlerMiddleware } = require("./middlewares");
// ---------- Middleware----------
// Passport
require("./config/passport");

// CORS
// For front end and back end don't stand on the same domain
app.use(cors());

// Passport
// passport needs session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// JSON
// Read the json format from http request
app.use(express.json());

// File Uploading
// The file won't be saved in local
// There is only a temporary path
app.use(fileUpload({ useTempFiles: true }));

// Cookie
// cookie will be appeared inside of req.cookie or req.signedCookie
app.use(cookieParser(process.env.COOKIE_SECRET));

// Static Folder Location
app.use(express.static("./public"));

// Logger: display req info on the console
app.use(morgan("tiny"));

// Routing
app.get("/api/", (req, res) => {
  res.send("HEY");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/task", taskRouter);

// Routes - Not Found
app.use(notFoundMiddleware);
// Error Handling
app.use(errorHandlerMiddleware);

// ---------- Listening ----------
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    console.log("Connect to MongoDB");
    app.listen(port, () => {
      console.log(`The server is running on port: ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
};

start();
