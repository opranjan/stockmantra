// services/email.service.js
// Uses a pooled SMTP transport so connections are reused across messages.
// Without pooling, each send pays the full TCP+TLS handshake (~500ms on Hostinger).
require("dotenv").config();
const nodemailer = require("nodemailer");

const SMTP_POOL_MAX = parseInt(process.env.SMTP_POOL_MAX || "5", 10);
const SMTP_RATE_PER_SEC = parseInt(process.env.SMTP_RATE_PER_SEC || "10", 10);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },

  // --- pooling / throughput controls ---
  pool: true,
  maxConnections: SMTP_POOL_MAX,
  maxMessages: 100,              // recycle a connection after N messages
  rateDelta: 1000,
  rateLimit: SMTP_RATE_PER_SEC,  // hard cap to avoid Hostinger throttling

  // sensible timeouts so jobs fail fast and retry
  connectionTimeout: 15_000,
  greetingTimeout: 10_000,
  socketTimeout: 30_000,
});

// Verify once at startup so misconfig is loud, not silent.
transporter.verify().then(
  () => console.log(`📧 SMTP ready (pool=${SMTP_POOL_MAX}, rate=${SMTP_RATE_PER_SEC}/s)`),
  (err) => console.error("📧 SMTP verify failed:", err.message)
);

/**
 * Send email via the pooled SMTP transport.
 */
async function sendEmail({ to, cc, subject, html, attachment, filename }) {
  const mailOptions = {
    from: `"${process.env.COMPANY_NAME || "Stock Matra Pvt Ltd."}" <${process.env.SMTP_USER}>`,
    to,
    cc,
    subject,
    html,
    replyTo: process.env.COMPANY_EMAIL || process.env.SMTP_USER,
    attachments: attachment
      ? [
          {
            filename: filename || "invoice.pdf",
            content: attachment,
            contentType: "application/pdf",
          },
        ]
      : [],
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent to ${to}: ${info.messageId}`);
  return info;
}

function closeTransporter() {
  return new Promise((resolve) => {
    try {
      transporter.close();
    } catch (_) {
      /* ignore */
    }
    resolve();
  });
}

module.exports = { sendEmail, transporter, closeTransporter };
