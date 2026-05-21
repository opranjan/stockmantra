// controllers/submission.controller.js
// Flow:
//   1. Validate fields + files
//   2. Upload PAN + Aadhar to Cloudinary in parallel
//   3. Persist the Submission to Mongo
//   4. Enqueue invoice-email job (PDF generation + send happens in worker)
//   5. Return 201 immediately with the saved submission
//
// The user no longer waits for PDF rendering or SMTP. If SMTP is down the
// worker retries 5x with exponential backoff; the submission is still saved.

const multer = require("multer");
const Submission = require("../models/Submission");
const { uploadToCloudinary } = require("../services/cloudinary.service");
const { validateBody } = require("../utils/validate");
const { emailQueue, JOB_TYPES } = require("../queues");

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

    const errors = validateBody ? validateBody(req.body) : [];
    if (!panFile) errors.push({ field: "panDoc", message: "PAN document is required." });
    if (!aadharFile) errors.push({ field: "aadharDoc", message: "Aadhar document is required." });
    if (errors.length) return res.status(400).json({ ok: false, errors });

    // Parallel uploads — Cloudinary is the slowest step (~1-3s per file).
    const pan = req.body.pan.toUpperCase();
    const stamp = Date.now();
    const [panDocMeta, aadharDocMeta] = await Promise.all([
      uploadToCloudinary(panFile.buffer, `${stamp}-${pan}-PAN-${panFile.originalname}`),
      uploadToCloudinary(aadharFile.buffer, `${stamp}-${pan}-AADHAR-${aadharFile.originalname}`),
    ]);

    const submission = await Submission.create({
      fullName: req.body.fullName,
      email: req.body.email,
      mobile: req.body.mobile,
      pan,
      dob: req.body.dob,
      amount: parseFloat(req.body.amount),
      paymentDate: req.body.paymentDate,
      txnId: req.body.txnId,
      agentName: req.body.agentName,
      panDoc: panDocMeta,
      aadharDoc: aadharDocMeta,
    });

    // Enqueue email — keep payload small (just the ID).
    // jobId based on txnId so duplicate submits don't double-send.
    // BullMQ forbids ':' in custom IDs, so use '-' as separator.
    const job = await emailQueue.add(
      JOB_TYPES.INVOICE_EMAIL,
      { submissionId: submission._id.toString() },
      { jobId: `invoice-${submission.txnId}` }
    );

    return res.status(201).json({
      ok: true,
      message: "Submission saved. Invoice email is being sent.",
      data: submission,
      jobId: job.id,
    });
  } catch (err) {
    console.error("❌ Submit error:", err);
    return res.status(500).json({ ok: false, message: "Server error." });
  }
}

// GET all submissions (Admin Panel) — lean() avoids hydration overhead.
async function getSubmissions(req, res) {
  try {
    const { page = 1, limit = 10, search = "", fromDate, toDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

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

    const dateQuery = {};
    if (fromDate || toDate) {
      dateQuery.paymentDate = {};
      if (fromDate) dateQuery.paymentDate.$gte = new Date(fromDate);
      if (toDate) dateQuery.paymentDate.$lte = new Date(toDate);
    }

    const query = { ...searchQuery, ...dateQuery };

    const [data, total] = await Promise.all([
      Submission.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Submission.countDocuments(query),
    ]);

    return res.status(200).json({
      ok: true,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      data,
    });
  } catch (err) {
    console.error("❌ Get submissions error:", err);
    return res.status(500).json({ ok: false, message: "Failed to fetch submissions" });
  }
}

async function getSubmissionById(req, res) {
  try {
    const submission = await Submission.findById(req.params.id).lean();
    if (!submission) {
      return res.status(404).json({ ok: false, message: "Submission not found" });
    }
    return res.status(200).json({ ok: true, data: submission });
  } catch (err) {
    console.error("❌ Get submission error:", err);
    return res.status(500).json({ ok: false, message: "Failed to fetch submission" });
  }
}

module.exports = { uploadFields, submit, getSubmissions, getSubmissionById };
