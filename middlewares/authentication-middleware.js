// Custom Error
const CustomError = require("../errors");
// Token
const { isTokenValid } = require("../utils");
// Models
const { Token } = require("../models");
// Utils
const { attachCookiesToResponse } = require("../utils");

const authenticateUser = async (req, res, next) => {
  // Cookie will be sent from the request
  const { refreshToken, accessToken } = req.signedCookies;

  try {
    // Getting info from accessToken
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      // Access Token encrypted parts of user info
      req.user = payload.user;
      return next();
    }

    // Refresh Token contains user and refresh token
    const payload = isTokenValid(refreshToken);
    // Searching Token in database
    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });

    // if there is not token, and the token isn't valid
    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError("Authentication Invalid");
    }
    
    // it will create the accessToken to user
    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });
    
    req.user = payload.user;
    next();
  } catch (err) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthenticatedError(
        `Unauthorized to access this route`
      );
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
