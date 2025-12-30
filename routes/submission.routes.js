const router = require("express").Router();
const { uploadFields, submit ,   getSubmissions,
  getSubmissionById,} = require("../controllers/submission.controller");


// Health
router.get("/health", (_req, res) => res.json({ ok: true }));

// Submit
router.post("/submit", uploadFields, submit);


// GET – admin panel list
router.get("/userkyc/", getSubmissions);

// GET – single submission
router.get("/userkyc/:id", getSubmissionById);


module.exports = router;
