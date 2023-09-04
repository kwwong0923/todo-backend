// Models
const { Task } = require("../models");
// Status Code
const { StatusCodes } = require("http-status-codes");
// Auth
const { checkPermission } = require("../utils");
// Custom Error
const CustomError = require("../errors");

// ---------- Functions -----------
const createTask = async (req, res) => {
  const { userId } = req.user;
  req.body.user = userId;
  const newTask = await Task.create(req.body);

  res.status(StatusCodes.OK).json({ task: newTask });
};

const getAllTasks = async (req, res) => {
  const { userId } = req.user;
  const tasks = await Task.find({ user: userId });

  return res.statusCodes(StatusCodes.OK).json({ tasks, count: tasks.length });
};

const getSingleTask = async (req, res) => {
  const { id: taskId } = req.body;

  const task = await Task.findOne({ _id: taskId });

  if (task) {
    throw new CustomError.NotFoundError(`There is not task with id: ${taskId}`);
  }
  // Check permission, is it belong to the user
  checkPermission(req.user, task.user);

  return res.statusCode(StatusCodes.OK).json({ task });
};

const updateTask = async (req, res) => {
  res.send("updateTask");
};

const deleteTask = async (req, res) => {
  res.send("deleteTask");
};

const uploadImage = async (req, res) => {
  res.send("uploadImage");
};

module.exports = {
  createTask,
  getAllTasks,
  getSingleTask,
  updateTask,
  deleteTask,
  uploadImage,
};
