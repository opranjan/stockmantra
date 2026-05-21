// queues/handlers/invoiceEmail.js
// Generates the invoice PDF and emails it. PDF generation is CPU-bound but
// short (<300ms typical for pdfkit), and SMTP is I/O — so worker concurrency
// of ~5-10 is a safe default.

const Submission = require("../../models/Submission");
const { generateInvoiceBuffer } = require("../../services/invoice.service");
const { sendEmail } = require("../../services/email.service");
const { welcomeEmailTemplate } = require("../../templates/welcomeEmail");

async function handleInvoiceEmail(job) {
  const { submissionId } = job.data;
  const submission = await Submission.findById(submissionId);
  if (!submission) throw new Error(`Submission ${submissionId} not found`);

  await job.updateProgress(20);

  const pdfBuffer = await generateInvoiceBuffer(submission);
  await job.updateProgress(60);

  const startDate = new Date(submission.paymentDate);
  const formattedStart = startDate.toLocaleDateString("en-IN");

  const emailHtml = welcomeEmailTemplate({
    name: submission.fullName,
    email: submission.email,
    mobile: submission.mobile,
    amount: submission.amount,
    startDate: formattedStart,
    invoiceNo: `INV-${submission.txnId}`,
  });

  await sendEmail({
    to: submission.email,
    cc: process.env.EMAIL_CC,
    subject: "Welcome Onboard – Your Research Service Details & Disclosures",
    html: emailHtml,
    attachment: pdfBuffer,
    filename: `Invoice_${submission.txnId}.pdf`,
  });

  await job.updateProgress(100);
  return { sentTo: submission.email, txnId: submission.txnId };
}

module.exports = { handleInvoiceEmail };
