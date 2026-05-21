const router = require("express").Router();
const {
  uploadFields,
  submit,
  getSubmissions,
  getSubmissionById,
} = require("../controllers/submission.controller");
const { submitLimiter } = require("../middleware/rateLimit");

router.get("/health", (_req, res) => res.json({ ok: true }));

router.post("/submit", submitLimiter, uploadFields, submit);

router.get("/userkyc/", getSubmissions);
router.get("/userkyc/:id", getSubmissionById);

module.exports = router;
