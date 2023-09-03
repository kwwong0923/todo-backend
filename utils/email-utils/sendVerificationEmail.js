const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}) => {
  const verifyEmailURL = `${origin}/auth/verify-email?token=${verificationToken}&email=${email}`;
  const message = `<p>Please confirm your email by clicking on the following link: <a href=${verifyEmailURL}>Verify Your Account</a></p>`;
  return sendEmail({
    to: email,
    subject: "Email Confirmation",
    html: `<h4>${name}</h4>${message}`,
  });
};

module.exports = sendVerificationEmail;
