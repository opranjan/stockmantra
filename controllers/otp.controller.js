// controllers/otp.controller.js
// Redis stores the OTP; the email is enqueued for async delivery.
// API returns ~50ms instead of waiting for SMTP.

const crypto = require("crypto");
const { saveOtp, verifyOtp: verifyStoredOtp } = require("../services/otp.service");
const { emailQueue, JOB_TYPES } = require("../queues");

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ ok: false, message: "Email is required" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    await saveOtp(email, otp);

    // Enqueue rather than send inline. jobId dedupes if user spams "Send OTP".
    await emailQueue.add(
      JOB_TYPES.OTP_EMAIL,
      { email, otp },
      { jobId: `otp-${email}-${Date.now()}` }
    );

    return res.status(200).json({
      ok: true,
      message: "OTP sent successfully to your email.",
    });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res.status(500).json({ ok: false, message: "Failed to send OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ ok: false, message: "Email and OTP are required" });
    }

    const result = await verifyStoredOtp(email, otp);
    if (!result.ok) {
      const message =
        result.reason === "expired"
          ? "OTP expired. Please request a new one."
          : result.reason === "too_many_attempts"
          ? "Too many wrong attempts. Please request a new OTP."
          : "Invalid OTP";
      return res.status(400).json({ ok: false, message });
    }

    return res.status(200).json({ ok: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({ ok: false, message: "OTP verification failed" });
  }
};
