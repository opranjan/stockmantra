// controllers/submission.controller.js
const multer = require("multer");
const Submission = require("../models/Submission");
const { uploadToCloudinary } = require("../services/cloudinary.service");
const { validateBody } = require("../utils/validate");
const { sendEmail } = require("../services/email.service");
const { welcomeEmailTemplate } = require("../templates/welcomeEmail");
const { generateInvoiceBuffer } = require("../services/invoice.service");

const allowedMime = new Set(["application/pdf", "image/png", "image/jpeg"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMime.has(file.mimetype)) cb(null, true);
    else cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type."));
  },
});

const uploadFields = upload.fields([
  { name: "panDoc", maxCount: 1 },
  { name: "aadharDoc", maxCount: 1 },
]);

async function submit(req, res) {
  try {
    const files = req.files || {};
    const panFile = files.panDoc?.[0];
    const aadharFile = files.aadharDoc?.[0];

    // Validate input
    const errors = validateBody ? validateBody(req.body) : [];
    if (!panFile) errors.push({ field: "panDoc", message: "PAN document is required." });
    if (!aadharFile) errors.push({ field: "aadharDoc", message: "Aadhar document is required." });
    if (errors.length) return res.status(400).json({ ok: false, errors });

    // Upload to Cloudinary
    const panDocMeta = await uploadToCloudinary(
      panFile.buffer,
      `${Date.now()}-${req.body.pan}-PAN-${panFile.originalname}`
    );
    const aadharDocMeta = await uploadToCloudinary(
      aadharFile.buffer,
      `${Date.now()}-${req.body.pan}-AADHAR-${aadharFile.originalname}`
    );

    // Save submission
    const submission = await Submission.create({
      fullName: req.body.fullName,
      email: req.body.email,
      mobile: req.body.mobile,
      pan: req.body.pan.toUpperCase(),
      dob: req.body.dob,
      amount: parseFloat(req.body.amount),
      paymentDate: req.body.paymentDate,
      txnId: req.body.txnId,
      agentName: req.body.agentName,
      panDoc: panDocMeta,
      aadharDoc: aadharDocMeta,
    });

    // Generate invoice PDF in memory
    const pdfBuffer = await generateInvoiceBuffer(submission);

    // Calculate subscription period (2 days sample)
    const startDate = new Date(submission.paymentDate);
    const endDate = new Date(startDate.getTime() + 2 * 86400000);
    const formattedStart = startDate.toLocaleDateString("en-IN");
    const formattedEnd = endDate.toLocaleDateString("en-IN");

    // Generate HTML email
    const emailHtml = welcomeEmailTemplate({
      name: submission.fullName,
      email: submission.email,         // ✅ added email
      mobile: submission.mobile,   
      amount: submission.amount,
      startDate: formattedStart,
      // endDate: formattedEnd,
      invoiceNo: `INV-${submission.txnId}`,
    });

    // Send via Hostinger SMTP
    await sendEmail({
      to: submission.email,
      cc: process.env.EMAIL_CC,
      subject: "Welcome Onboard – Your Research Service Details & Disclosures",
      html: emailHtml,
      attachment: pdfBuffer,
      filename: `Invoice_${submission.txnId}.pdf`,
    });

    return res.status(201).json({
      ok: true,
      message: "Submission saved and email sent with invoice.",
      data: submission,
    });
  } catch (err) {
    console.error("❌ Submit error:", err);
    return res.status(500).json({ ok: false, message: "Server error." });
  }
}

module.exports = { uploadFields, submit };
