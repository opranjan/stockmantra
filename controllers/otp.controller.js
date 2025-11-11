
const crypto = require("crypto");
const Otp = require("../models/Otp");
const nodemailer = require("nodemailer");

// use your Hostinger SMTP setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ ok: false, message: "Email is required" });

    const otp = crypto.randomInt(100000, 999999).toString();
    await Otp.deleteMany({ email }); // remove old OTPs
    await Otp.create({ email, otp });

    const mailOptions = {
      from: `"Stock Mantra" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your One-Time Password (OTP) - Stock Mantra",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 15px; color: #333;">
          <h3 style="color:#1F3B77;">Stock Mantra Pvt Ltd</h3>
          <p>Dear User,</p>
          <p>Your One-Time Password (OTP) for verification is:</p>
          <h2 style="color:#1F3B77; letter-spacing: 2px;">${otp}</h2>
          <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          <p>If you didn’t request this, please ignore this email.</p>
          <br/>
          <p>Warm regards,<br/>Stock Mantra Pvt Ltd</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      ok: true,
      message: "OTP sent successfully to your email.",
    });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ ok: false, message: "Failed to send OTP" });
  }
};

// ✅ Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ ok: false, message: "Email and OTP are required" });

    const record = await Otp.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ ok: false, message: "Invalid or expired OTP" });
    }

    // OTP verified → delete it to prevent reuse
    await Otp.deleteMany({ email });

    return res.status(200).json({ ok: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ ok: false, message: "OTP verification failed" });
  }
};
