// Auth
const {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
} = require("./auth-utils/jwt");
const checkPermission = require("./auth-utils/checkPermission");
const createHash = require("./auth-utils/createHash");
const createTokenUser = require("./auth-utils/createTokenUser");
// Email
const sendResetPasswordEmail = require("./email-utils/sendResetPasswordEmail");
const sendVerificationEmail = require("./email-utils/sendVerificationEmail");

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  checkPermission,
  createHash,
  createTokenUser,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
