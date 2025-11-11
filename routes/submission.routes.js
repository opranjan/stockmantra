const router = require("express").Router();
const { uploadFields, submit } = require("../controllers/submission.controller");


// Health
router.get("/health", (_req, res) => res.json({ ok: true }));

// Submit
router.post("/submit", uploadFields, submit);


module.exports = router;
