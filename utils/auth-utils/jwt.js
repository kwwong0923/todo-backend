const jwt = require("jsonwebtoken");

// Create JWT
const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
};

// Return boolean to check if the token is valid
const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: { user } }); // For short time
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } }); // For long time
  // Define the duration of the JWT
  const oneDay = 1000 * 60 * 60 * 24; // One Day
  const longerExp = 1000 * 60 * 60 * 24 * 30; // 30 Days

  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + longerExp),
  });
};

module.exports = { createJWT, isTokenValid, attachCookiesToResponse };

// With expires
// const createJWT = ({ payload }) => {
//   const token = jwt.sign(payload, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_LIFETIME,
//   });
//   return token;
// };

// Attach one token
// const attachCookiesToResponse = ({ res, user }) => {
//   const token = createJWT({ payload: user });

//   const oneDay = 1000 * 60 * 60 * 24;

//   res.cookie('token', token, {
//     httpOnly: true,
//     expires: new Date(Date.now() + oneDay),
//     secure: process.env.NODE_ENV === 'production',
//     signed: true,
//   });
// };
