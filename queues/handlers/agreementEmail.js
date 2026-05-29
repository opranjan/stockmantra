// queues/handlers/agreementEmail.js
// Sends the agreement confirmation email using the shared welcomeEmailTemplate
// (same body as invoice email). The only thing that differs is the attached
// PDF — agreement PDF here, invoice PDF in the invoice handler.

const Submission = require("../../models/Submission");
const { sendEmail } = require("../../services/email.service");
const { generateUserAgreementBuffer } = require("../../services/agreement.service");
const { welcomeEmailTemplate } = require("../../templates/welcomeEmail");

async function handleAgreementEmail(job) {
  const { submissionId, clientIp } = job.data;
  const submission = await Submission.findById(submissionId);
  if (!submission) throw new Error(`Submission ${submissionId} not found`);

  await job.updateProgress(20);

  const agreementBuffer = await generateUserAgreementBuffer(submission, clientIp);
  await job.updateProgress(60);

  // welcomeEmailTemplate calls amount.toFixed and renders startDate/invoiceNo
  // directly into HTML — fall back to safe values so /submitandpay rows that
  // skip those fields don't crash the render.
  const formattedStart = submission.paymentDate
    ? new Date(submission.paymentDate).toLocaleDateString("en-IN")
    : "—";

  const emailHtml = welcomeEmailTemplate({
    name: submission.fullName,
    email: submission.email,
    mobile: submission.mobile,
    amount: typeof submission.amount === "number" ? submission.amount : 0,
    startDate: formattedStart,
    invoiceNo: submission.txnId ? `INV-${submission.txnId}` : "—",
  });

  await sendEmail({
    to: submission.email,
    cc: process.env.EMAIL_CC,
    subject: "Thank you for agreeing to our Terms – Stock Mantra",
    html: emailHtml,
    attachment: agreementBuffer,
    filename: `User_Agreement_${submission.txnId || submission._id}.pdf`,
  });

  await job.updateProgress(100);
  return { sentTo: submission.email, txnId: submission.txnId };
}

module.exports = { handleAgreementEmail };
