// Models
const { User, Token } = require("../models");
// Status Code
const { StatusCodes } = require("http-status-codes");
// Error
const CustomError = require("../errors");
// Utils
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
} = require("../utils");

const crypto = require("crypto");

const register = async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    throw new CustomError.BadRequestError(
      `Please provide all the values of user`
    );
  }

  // Check if the email exist or not
  const emailAlreadyExist = await User.findOne({ email });
  if (emailAlreadyExist) {
    throw new CustomError.BadRequestError("Email already registered");
  }

  // First registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  // Verification Token
  // Create a random string
  const verificationToken = crypto.randomBytes(40).toString("hex");
  const user = await User.create({
    email,
    name,
    password,
    role,
    verificationToken,
  });

  // Sending Verification Email
  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin: process.env.ORIGIN,
  });

  res.status(StatusCodes.CREATED).json({
    message:
      "Registration Successfully, Please check your email to verify account",
  });
};

const verifyEmail = async (req, res) => {
  // Getting data from url query (?token&email)
  const { token, email } = req.query;

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Verification Failed");
  }

  if (token !== user.verificationToken) {
    throw new CustomError.UnauthenticatedError("Verification Failed");
  }

  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = null;

  await user.save();

  return res
    .status(StatusCodes.OK)
    .json({ message: `${user.name}'s Email Verified` });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  // Check if the data is completed
  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });
  // If the user doesn't exist
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  // Checking password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  // Creating a token user that only contains certain data (No Password)
  const tokenUser = createTokenUser(user);

  // Creating refresh token
  let refreshToken = "";
  // Check if the token existing: user._id
  const existingToken = await Token.findOne({ user: user._id });
  console.log(existingToken);
  if (existingToken) {
    if (!existingToken.isValid) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    return res.status(StatusCodes.OK).json({ user: tokenUser });
  }

  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, userAgent, ip, user: user._id };

  await Token.create(userToken);
  // RefreshToken -> accessToken (user), refreshToken (user + refreshToken)
  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  return res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  const { userId } = req.user;
  await Token.findOneAndDelete({ user: userId });

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  return res.status(StatusCodes.OK).json({ message: `User logged out` });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError.BadRequestError("Please provide email");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.NotFoundError("User not found");
  }

  const passwordToken = crypto.randomBytes(40).toString("hex");
  // Sending Email
  await sendResetPasswordEmail({
    name: user.name,
    email: user.email,
    token: passwordToken,
    origin: process.env.origin,
  });

  const oneHour = 1000 * 60 * 60;
  const passwordTokenExpirationDate = new Date(Date.now() + oneHour);

  user.passwordToken = createHash(passwordToken);
  user.passwordTokenExpirationDate = passwordTokenExpirationDate;
  await user.save();

  res
    .status(StatusCodes.OK)
    .json({ message: "Please check your email for reset password link" });
};

const resetPassword = async (req, res) => {
  const { email, password, token } = req.body;

  if (!email || !password || !token) {
    throw new CustomError.BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.NotFoundError("No User Found");
  }

  const currentDate = new Date();
  if (
    user.passwordToken === createHash(token) &&
    user.passwordTokenExpirationDate > currentDate
  ) {
    user.password = password;
    user.passwordToken = null;
    user.passwordTokenExpirationDate = null;
    await user.save();
  }

  res.status(StatusCodes.OK).json({ message: "Password reset" });
};

const googleLogin = async (req, res) => {

  const tokenUser = createTokenUser(req.user);
  let refreshToken = "";
  // req.user already is tokenUser, it's set in passport
  const existingToken = await Token.findOne({ user: tokenUser.userId });
  if (existingToken) {
    if (!existingToken.isValid) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    return res.status(StatusCodes.OK).redirect(process.env.REDIRECT_URL);
  }
  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, userAgent, ip, user: tokenUser.userId };
  await Token.create(userToken);
  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  return res.status(StatusCodes.OK).redirect(process.env.REDIRECT_URL);
};

// const googleLogin = async (req, res) => {
//   console.log(req.user);
//   let refreshToken = "";
//   // req.user already is tokenUser, it's set in passport
//   const existingToken = await Token.findOne({ user: req.user.userId });
//   if (existingToken) {
//     if (!existingToken.isValid) {
//       throw new CustomError.UnauthenticatedError("Invalid Credentials");
//     }
//     refreshToken = existingToken.refreshToken;
//     attachCookiesToResponse({ res, user: req.user, refreshToken });
//     return res.status(StatusCodes.OK).redirect(process.env.REDIRECT_URL);
//   }
//   refreshToken = crypto.randomBytes(40).toString("hex");
//   const userAgent = req.headers["user-agent"];
//   const ip = req.ip;
//   const userToken = { refreshToken, userAgent, ip, user: req.user.userId };
//   await Token.create(userToken);
//   attachCookiesToResponse({ res, user: req.user, refreshToken });

//   return res.status(StatusCodes.OK).redirect(process.env.REDIRECT_URL);
// };

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleLogin,
};
