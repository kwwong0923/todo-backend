const { StatusCodes } = require("http-status-codes");
const notFoundMiddleware = (req, res) => {
  // Get the not found url
  const url = req.url;
  res
    .status(StatusCodes.NOT_FOUND)
    .json({ message: `The route (${url}) does not exist` });
};

module.exports = notFoundMiddleware;
