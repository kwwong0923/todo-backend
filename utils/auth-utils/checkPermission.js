const CustomError = require("../../errors");

const checkPermission = (requestUser, resourceUserId) => {
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId.toString()) return;
  // Not an admin and the owner of data
  throw new CustomError.UnauthorizedError(
    `Not authorized to access this route`
  );
};

module.exports = checkPermission;
