const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../middlewares");

// Task Controller
const {
  createTask,
  getAllTasks,
  getSingleTask,
  updateTask,
  deleteTask,
  uploadImage,
} = require("../controllers").taskController;

router
  .route("/")
  .get(authenticateUser, getAllTasks)
  .post(authenticateUser, createTask);

router.route("/upload").post(authenticateUser, uploadImage);

router
  .route("/:id")
  .get(authenticateUser, getSingleTask)
  .patch(authenticateUser, updateTask)
  .delete(authenticateUser, deleteTask);

module.exports = router;
