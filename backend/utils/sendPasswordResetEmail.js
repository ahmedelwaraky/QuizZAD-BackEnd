import nodemailer from 'nodemailer';

const sendPasswordResetEmail = async (options) => {
  //  Create a transporter
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const emailOptions = {
    from: '"Quizzad" <ahmednada100@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  await transport.sendMail(emailOptions);
};

export default sendPasswordResetEmail;
