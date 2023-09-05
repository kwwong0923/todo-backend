const passport = require("passport");
// scape means what kind of data you want "email" -> only email
// profile -> bring you whole user profile
// "profile", "email" + prompt: select_account
// which means every time user tries to login
// there will be some accounts option
const passportGoogleMiddleware = passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt: "select_account",
})

module.exports = passportGoogleMiddleware;