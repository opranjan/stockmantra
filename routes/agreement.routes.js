// routes/agreement.routes.js
const express = require("express");
const router = express.Router();
const { sendAgreementEmail } = require("../controllers/agreement.controller");

// POST /api/send-agreement
router.post("/send-agreement", sendAgreementEmail);

module.exports = router;
