// controllers/agreement.controller.js
// Looks up the submission, then enqueues PDF+email rendering. Returns 200
// immediately. The worker generates the agreement PDF and sends the email
// with retries.

const Submission = require("../models/Submission");
const { emailQueue, JOB_TYPES } = require("../queues");

function getClientIp(req) {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip;

  if (ip === "::1") ip = "127.0.0.1";
  if (ip?.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  return ip;
}

async function sendAgreementEmail(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ ok: false, message: "Email is required." });
    }

    const submission = await Submission.findOne({ email }).lean();
    if (!submission) {
      return res.status(404).json({ ok: false, message: "No submission found for this email." });
    }

    const clientIp = getClientIp(req);
    const job = await emailQueue.add(
      JOB_TYPES.AGREEMENT_EMAIL,
      { submissionId: submission._id.toString(), clientIp },
      { jobId: `agreement-${submission.txnId}-${Date.now()}` }
    );

    return res.status(200).json({
      ok: true,
      message: `Agreement email queued for ${submission.email}.`,
      jobId: job.id,
    });
  } catch (err) {
    console.error("❌ Agreement enqueue error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to queue agreement email.",
    });
  }
}

module.exports = { sendAgreementEmail };
