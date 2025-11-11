require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const { connectDB } = require("./utils/db");
const { corsAll } = require("./utils/cors");
const submissionRoutes = require("./routes/submission.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const agreementRoutes = require("./routes/agreement.routes");
const otpRoutes = require("./routes/otp.routes");

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

const app = express();

app.use(corsAll());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

connectDB(MONGO_URI);

app.use("/api", submissionRoutes);
app.use("/api", invoiceRoutes); 
app.use("/api", agreementRoutes);
app.use("/api/otp", otpRoutes);

app.use((err, _req, res, _next) => {
  if (err?.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ ok: false, message: "File too large (max 5MB)." });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        ok: false,
        message: `Unexpected file field "${err.field}". Expected: panDoc, aadharDoc`,
      });
    }
    return res.status(400).json({ ok: false, message: `Upload error: ${err.message}` });
  }
  console.error("Unexpected error:", err);
  res.status(500).json({ ok: false, message: "Unexpected server error." });
});

app.listen(PORT, () => console.log(`🚀 API listening on http://localhost:${PORT}`));
