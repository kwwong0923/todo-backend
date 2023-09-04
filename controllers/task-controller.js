// Models
const { Task } = require("../models");
// Status Code
const { StatusCodes } = require("http-status-codes");
// Auth
const { checkPermission } = require("../utils");
// Custom Error
const CustomError = require("../errors");
// Folder System
const fs = require("fs");
// Cloudinary (Cloud Storage)
const cloudinary = require("cloudinary").v2;

// ---------- Functions -----------
const createTask = async (req, res) => {
  const { userId } = req.user;
  req.body.user = userId;
  const newTask = await Task.create(req.body);

  return res.status(StatusCodes.OK).json({ task: newTask });
};

const getAllTasks = async (req, res) => {
  const { userId } = req.user;
  const tasks = await Task.find({ user: userId });

  return res.status(StatusCodes.OK).json({ tasks, count: tasks.length });
};

const getSingleTask = async (req, res) => {
  const { id: taskId } = req.params;

  const task = await Task.findOne({ _id: taskId });

  checkPermission(req.user, task.user);

  if (!task) {
    throw new CustomError.NotFoundError(`There is not task with id: ${taskId}`);
  }
  // Check permission, is it belong to the user
  checkPermission(req.user, task.user);

  return res.status(StatusCodes.OK).json({ task });
};

const updateTask = async (req, res) => {
  const { userId } = req.user;
  const { id: taskId } = req.params;
  const { title, content, category, image, status } = req.body;

  const foundTask = await Task.findOne({ _id: taskId });

  checkPermission(req.user, foundTask.user);

  let updateObject = {};
  if (title) updateObject.title = title;
  if (content) updateObject.content = content;
  if (category) updateObject.category = category;
  if (image) updateObject.image = image;
  if (status) updateObject.status = status;

  // const updatedTask = await foundTask.updateOne(updateObject, {
  //   new: true,
  //   runValidators: true,
  // });
  const updatedTask = await Task.findOneAndUpdate(
    { _id: taskId, user: userId },
    updateObject,
    {
      new: true,
      runValidators: true,
    }
  );

  return res.status(StatusCodes.OK).json({ task: updatedTask });
};

const deleteTask = async (req, res) => {
  const { id: taskId } = req.params;
  const { userId } = req.user;

  const foundTask = await Task.findOne({ _id: taskId });

  checkPermission(req.user, foundTask.user);
  const deletedTask = await foundTask.deleteOne();
  // const deletedTask = await Task.findOneAndDelete({
  //   _id: taskId,
  //   user: userId,
  // });

  return res
    .status(StatusCodes.OK)
    .json({ message: `Task ${foundTask.title} is removed` });
};

const uploadImage = async (req, res) => {
  console.log(req.files);
  if (!req.files.image.mimetype.startsWith("image")) {
    fs.unlinkSync(req.files.image.tempFilePath);
    throw new CustomError.BadRequestError("Please upload image");
  }

  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: process.env.CLOUD_FILE,
    }
  );

  // clean up the temp files
  fs.unlinkSync(req.files.image.tempFilePath);
  console.log(result);
  return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
};

module.exports = {
  createTask,
  getAllTasks,
  getSingleTask,
  updateTask,
  deleteTask,
  uploadImage,
};
