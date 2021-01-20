const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "190c3ec84c83f4",
    pass: "8735682d088a74",
  },
});
