import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

interface SendMailParams {
  email: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ email, subject, html }: SendMailParams): Promise<void> => {
  try {
    const transporter: Transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};
