// controllers/agreement.controller.js
const Submission = require("../models/Submission");
const { sendEmail } = require("../services/email.service");
const { generateUserAgreementBuffer } = require("../services/agreement.service");

function agreementEmailTemplate(submission) {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafc; padding: 30px;">
    <div style="max-width: 600px; background: #fff; margin: auto; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 30px;">
      <h2 style="color: #2c3e50; text-align:center;">Thank you for agreeing to our Terms</h2>
      <p style="font-size: 15px; color: #333;">Hi <strong>${submission.fullName}</strong>,</p>
      <p style="font-size: 15px; color: #333;">
        We have recorded your acceptance of the <strong>Stock Mantra Pvt Ltd</strong> Terms & Conditions.
      </p>
      <h3 style="color:#2c3e50; border-bottom:1px solid #ddd; padding-bottom:5px;">Subscription Summary</h3>
      <p style="font-size: 14px; margin:6px 0;">Amount: <strong>₹${submission.amount.toFixed(2)}</strong></p>
      <p style="font-size: 14px; margin:6px 0;">Days: <strong>2</strong></p>
      <p style="font-size: 14px; margin:6px 0;">Transaction ID: <strong>${submission.txnId}</strong></p>
      <p style="font-size: 14px; margin:6px 0;">Payment Date: <strong>${submission.paymentDate}</strong></p>

      <div style="margin-top: 20px; background: #f3f4f6; padding: 15px; border-radius: 5px;">
        <p style="font-size: 14px; color:#333;">
          We've attached a PDF copy of your signed agreement for your records.
        </p>
      </div>

      <p style="margin-top: 30px; font-size: 13px; color: #555;">
        Stock Mantra Pvt Ltd<br>
        support@stockmantra.com<br>
        +91-98765-43210
      </p>
    </div>
  </div>
  `;
}

async function sendAgreementEmail(req, res) {
  try {
    const { email,ip } = req.body;

    if (!email) {
      return res.status(400).json({ ok: false, message: "Email is required." });
    }

    const submission = await Submission.findOne({ email });
    if (!submission) {
      return res.status(404).json({ ok: false, message: "No submission found for this email." });
    }

    // Generate agreement PDF
    const agreementBuffer = await generateUserAgreementBuffer(submission, ip);

    // Send email
    await sendEmail({
      to: submission.email,
      cc: process.env.EMAIL_CC,
      subject: "Thank you for agreeing to our Terms – Stock Mantra",
      html: agreementEmailTemplate(submission),
      attachment: agreementBuffer,
      filename: `User_Agreement_${submission.txnId}.pdf`,
    });

    return res.status(200).json({
      ok: true,
      message: `Agreement email sent successfully to ${submission.email}.`,
    });
  } catch (err) {
    console.error("❌ Agreement email error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to send agreement email.",
    });
  }
}

module.exports = { sendAgreementEmail };
