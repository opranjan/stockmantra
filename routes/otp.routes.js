const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp } = require("../controllers/otp.controller");
const { otpLimiter } = require("../middleware/rateLimit");

router.post("/send", otpLimiter, sendOtp);
router.post("/verify", verifyOtp);

module.exports = router;
