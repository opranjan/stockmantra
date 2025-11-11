// routes/invoice.routes.js
const express = require("express");
const router = express.Router();
const { generateInvoice } = require("../controllers/invoice.controller");

// GET /api/invoice/:txnId
router.get("/invoice/:txnId", generateInvoice);

module.exports = router;
