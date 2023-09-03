const sendEmail = require("./sendEmail");

const sendResetPasswordEmail = async ({ name, email, token, origin }) => {
  const resetPasswordURL = `${origin}/user/reset-password?token=${token}&email=${email}`;
  const message = `<p>Please reset password by click on the following link:
  <a href=${resetPasswordURL}>Reset Password</a>`;

  return sendEmail({
    to: email,
    subject: "Reset Password",
    html: `<h4>Hello ${name}</h4>${message}`,
  });
};

module.exports = sendResetPasswordEmail;
