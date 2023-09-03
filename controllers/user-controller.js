// Model
const { User, Token } = require("../models");
// Status Code
const { StatusCodes } = require("http-status-codes");
// Custom Error
const CustomError = require("../errors");
// Utils
const { createTokenUser, attachCookiesToResponse } = require("../utils");

// ----------- Functions ------------
const getAllUsers = async (req, res) => {
  console.log("getAllUsers");
  const users = await User.find({}).select("-password");
  return res.status(StatusCodes.OK).json({ users, count: users.length });
};

const getCurrentUser = async (req, res) => {
  if (!req.user) {
    throw new CustomError.NotFoundError("No User Found");
  }
  res.status(StatusCodes.OK).json({ user: req.user });
};

const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;
  const foundUser = await User.findOne({ _id: userId }).select("name email");

  if (!foundUser) {
    throw new CustomError.NotFoundError("No User Found");
  }

  return res.status(StatusCodes.OK).json({ user: foundUser });
};

const updateUserInfo = async (req, res) => {
  const { name, email } = req.body;
  const { userId } = req.user;
  const updateObj = {};

  if (name) {
    updateObj.name = name;
  }

  if (email) {
    updateObj.email = email;
  }

  const updatedUser = await User.findOneAndUpdate({ _id: userId }, updateObj, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new CustomError.NotFoundError("No User Found");
  }

  const token = await Token.findOne({ user: updatedUser._id });
  const tokenUser = createTokenUser(updatedUser);
  attachCookiesToResponse({
    res,
    user: tokenUser,
    refreshToken: token.refreshToken,
  });
  return res.status(StatusCodes.OK).json({ user: tokenUser });
};

module.exports = {
  getAllUsers,
  getCurrentUser,
  getSingleUser,
  updateUserInfo,
};
