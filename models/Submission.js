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
    pan: { type: String, required: true },
    dob: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: String, required: true },
    txnId: { type: String, required: true },
    agentName: { type: String, required: true },

    panDoc: { type: cloudinaryFileSchema, required: true },
    aadharDoc: { type: cloudinaryFileSchema, required: true },

    createdAt: { type: Date, default: Date.now },
  },
  { collection: "submissions" }
);

module.exports = mongoose.model("Submission", submissionSchema);
