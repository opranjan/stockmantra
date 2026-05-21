// queues/handlers/otpEmail.js
const { sendEmail } = require("../../services/email.service");

function otpTemplate(otp) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 15px; color: #333;">
      <h3 style="color:#1F3B77;">Stock Mantra Pvt Ltd</h3>
      <p>Dear User,</p>
      <p>Your One-Time Password (OTP) for verification is:</p>
      <h2 style="color:#1F3B77; letter-spacing: 2px;">${otp}</h2>
      <p>This OTP is valid for <strong>5 minutes</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <br/>
      <p>Warm regards,<br/>ALDERLEAF STOCKMANTRA Pvt Ltd</p>
    </div>
  `;
}

async function handleOtpEmail(job) {
  const { email, otp } = job.data;
  await sendEmail({
    to: email,
    subject: "Your One-Time Password (OTP) - Stock Mantra",
    html: otpTemplate(otp),
  });
  return { sentTo: email };
}

module.exports = { handleOtpEmail };
