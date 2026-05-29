const router = require("express").Router();
const {
  uploadFields,
  submit,
  submitWithAgreement,
  getSubmissions,
  getSubmissionById,
  softDeleteSubmission,
  restoreSubmission,
} = require("../controllers/submission.controller");
const { submitLimiter } = require("../middleware/rateLimit");

router.get("/health", (_req, res) => res.json({ ok: true }));

router.post("/submit", submitLimiter, uploadFields, submit);

// Agreement-only "submit + pay" flow — accepts the same multipart fields
// as /submit so the e-sign frontend can attach PAN/Aadhar when present.
router.post("/submitandpay", submitLimiter, uploadFields, submitWithAgreement);

router.get("/userkyc/", getSubmissions);
router.get("/userkyc/:id", getSubmissionById);

router.delete("/userkyc/:id", softDeleteSubmission);
router.patch("/userkyc/:id/restore", restoreSubmission);

module.exports = router;
