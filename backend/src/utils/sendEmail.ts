import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
export default async function sendEmail(
  from: string,
  to: string,
  subject: string,
  html: string
) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "gipozkyjta3eh3pl@ethereal.email", // generated ethereal user
      pass: "TsQePAyD2AZ73U1xmc" // generated ethereal password
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from,
    to,
    subject,
    html
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
