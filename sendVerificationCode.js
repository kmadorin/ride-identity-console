"use strict";
const nodemailer = require("nodemailer");

async function sendVerificationCode(email, code){

  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "localhost",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'matt', // generated ethereal user
      pass: 'pass' // generated ethereal password
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Identity Oracle" <madorinkv@yandex.ru>', // sender address
    to: "madorinkv@yandex.ru", // list of receivers
    subject: "Your verification code", // Subject line
    text: `Your verification code is: ${code}`, // plain text body
  });
}

module.exports = sendVerificationCode