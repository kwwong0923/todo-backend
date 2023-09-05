const express = require("express");
const router = express.Router();
const passport = require("passport");

// Middlewares
const {
  authenticateUser,
  passportGoogleMiddleware,
} = require("../middlewares");
// Auth Controllers
const {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleLogin,
} = require("../controllers").authController;

router.post("/register", register);
router.post("/login", login);
router.delete("/logout", authenticateUser, logout);
router.post("/verify-email", verifyEmail);
// Temporary GET Request, because without front end
router.get("/verify-email", verifyEmail);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Google
router.get("/google", passportGoogleMiddleware);
router.get("/google/redirect", passport.authenticate("google"), googleLogin);

module.exports = router;
