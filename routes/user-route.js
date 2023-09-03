const express = require("express");
const router = express.Router();

// Auth Middlewares
const { authenticateUser, authorizePermissions } = require("../middlewares");
// Controller
const { getAllUsers, getCurrentUser, getSingleUser, updateUserInfo } =
  require("../controllers").userController;

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), getAllUsers);

router.route("/show-me").get(authenticateUser, getCurrentUser);

router.route("/update-user").patch(authenticateUser, updateUserInfo);
router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;
