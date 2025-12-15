// test-smtp.js
require("dotenv").config();
const nodemailer = require("nodemailer");

(async () => {
  console.log("🔍 Starting Hostinger SMTP test...");
  console.log("📧 Loaded .env config:");
  console.log({
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_SECURE: process.env.SMTP_SECURE,
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
    logger: true, // show detailed logs
    debug: true,  // show protocol logs
  });

  try {
    console.log("\n🕒 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection successful!");

    console.log("\n📨 Sending a test email to yourself...");
    const info = await transporter.sendMail({
      from: `"Stock Matra Pvt Ltd." <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // send to your own address
      cc: process.env.SMTP_CC_EMAIL,
      subject: "✅ Test Email via Hostinger SMTP",
      text: "If you received this, SMTP works perfectly!",
    });

    console.log("✅ Email sent:", info.messageId);
    console.log("📤 SMTP response:", info.response);
  } catch (error) {
    console.error("❌ SMTP connection or send failed!");
    console.error(error);
  }
})();
