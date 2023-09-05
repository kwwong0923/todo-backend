const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const { User } = require("../models");
const { createTokenUser } = require("../utils");

passport.serializeUser((user, done) => {
  done(null, user._id); // save the user into session, and signed id send to
});

passport.deserializeUser(async (_id, done) => {
  const user = await User.findOne({ _id });
  const tokenUser = createTokenUser(user);
  done(null, tokenUser); // req.user
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      let foundUser = await User.findOne({ email: profile.emails[0].value });

      if (foundUser) {
        if (!foundUser.googleId) {
          // update the local registered account the google id
          foundUser.googleId = profile.id;
          await foundUser.save();
        }

        done(null, foundUser);
      } else {
        const newUser = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          isVerified: true,
        });

        done(null, newUser);
      }
    }
  )
);
