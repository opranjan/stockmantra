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




// GET all submissions (Admin Panel)
async function getSubmissions(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      fromDate,
      toDate,
    } = req.query;

    const skip = (page - 1) * limit;

    // 🔍 Search filter
    const searchQuery = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { mobile: { $regex: search, $options: "i" } },
            { pan: { $regex: search, $options: "i" } },
            { txnId: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // 📅 Date filter
    const dateQuery = {};
    if (fromDate || toDate) {
      dateQuery.paymentDate = {};
      if (fromDate) dateQuery.paymentDate.$gte = new Date(fromDate);
      if (toDate) dateQuery.paymentDate.$lte = new Date(toDate);
    }

    const query = {
      ...searchQuery,
      ...dateQuery,
    };

    const [data, total] = await Promise.all([
      Submission.find(query)
        .sort({ createdAt: -1 }) // latest first
        .skip(skip)
        .limit(Number(limit)),
      Submission.countDocuments(query),
    ]);

    return res.status(200).json({
      ok: true,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (err) {
    console.error("❌ Get submissions error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to fetch submissions",
    });
  }
}




// GET submission by ID
async function getSubmissionById(req, res) {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({
        ok: false,
        message: "Submission not found",
      });
    }

    return res.status(200).json({
      ok: true,
      data: submission,
    });
  } catch (err) {
    console.error("❌ Get submission error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to fetch submission",
    });
  }
}



module.exports = { uploadFields, submit, getSubmissions, getSubmissionById };
