const {
  authenticateUser,
  authorizePermissions,
} = require("./authentication-middleware");

module.exports = {
  notFoundMiddleware: require("./not-found-middleware"),
  errorHandlerMiddleware: require("./error-handler-middleware"),
  authenticateUser,
  authorizePermissions,
};
