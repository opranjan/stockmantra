// models/Submission.js
const mongoose = require("mongoose");

const cloudinaryFileSchema = new mongoose.Schema(
  {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
    format: { type: String },
    bytes: { type: Number },
    resource_type: { type: String },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    // Non-KYC fields are optional so the agreement-only "submitandpay" flow
    // can persist a row with just name/email/mobile + signature.
    pan: { type: String, required: false },
    dob: { type: String, required: false },
    amount: { type: Number, required: false },
    paymentDate: { type: String, required: false },
    txnId: { type: String, required: false },
    agentName: { type: String, required: false },

    panDoc: { type: cloudinaryFileSchema, required: false },
    aadharDoc: { type: cloudinaryFileSchema, required: false },

    // Agreement + e-sign metadata (populated by submitWithAgreement)
    agreementAccepted: { type: Boolean, default: false },
    agreementAcceptedAt: { type: Date },
    agreementIp: { type: String },
    signature: { type: String },
    location: { type: String },

    // Soft-delete — indexed because most reads filter on it.
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },

    createdAt: { type: Date, default: Date.now },
  },
  { collection: "submissions" }
);

module.exports = mongoose.model("Submission", submissionSchema);
