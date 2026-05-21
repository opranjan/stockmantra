// server.js
// Hardened for high request volume:
//   - compression           : smaller JSON responses
//   - helmet                : security headers
//   - express-rate-limit    : DDoS / SMTP-abuse protection (Redis-backed)
//   - body size limits      : prevents memory blow-up on bad clients
//   - trust proxy           : real client IP behind load balancers
//   - in-process BullMQ     : PDF + email run off the request thread
//   - graceful shutdown     : drains queue + closes DB/SMTP/Redis cleanly
//
// To scale further, run `npm run worker` on extra boxes — they share the same Redis queue.

require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");

const { connectDB } = require("./utils/db");
const { corsAll } = require("./utils/cors");
const { closeRedis } = require("./utils/redis");

const submissionRoutes = require("./routes/submission.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const agreementRoutes = require("./routes/agreement.routes");
const otpRoutes = require("./routes/otp.routes");
const queueRoutes = require("./routes/queue.routes");

const { globalLimiter } = require("./middleware/rateLimit");
const { startWorker, stopWorker } = require("./queues/worker");
const { closeQueues } = require("./queues");
const { closeTransporter } = require("./services/email.service");

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const RUN_WORKER_IN_PROCESS = process.env.RUN_WORKER_IN_PROCESS !== "false";

const app = express();

// Behind nginx / load balancer — trust X-Forwarded-For so rate limit + IP logging
// reflect real client, not the proxy.
app.set("trust proxy", 1);

app.use(corsAll());
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// JSON limit: enough for any non-upload route. File uploads go through multer,
// which has its own 5MB limit per file.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Apply global limiter to all /api/* — route-specific stricter limits stack on top.
app.use("/api", globalLimiter);

// Routes
app.use("/api", submissionRoutes);
app.use("/api", invoiceRoutes);
app.use("/api", agreementRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api", queueRoutes);

// Error handler
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

let server;

async function start() {
  if (!MONGO_URI) {
    console.error("MONGO_URI is required");
    process.exit(1);
  }
  await connectDB(MONGO_URI);

  if (RUN_WORKER_IN_PROCESS) {
    startWorker();
  } else {
    console.log("⚙️  In-process worker disabled (RUN_WORKER_IN_PROCESS=false). Run `npm run worker` separately.");
  }

  server = app.listen(PORT, () => {
    console.log(`🚀 API listening on http://localhost:${PORT}`);
  });

  // Keep-alive tuning helps when sitting behind nginx/AWS ELB
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;
}

// --- Graceful shutdown --------------------------------------------------------
// Stop accepting new connections, drain in-flight requests, close worker
// (so it doesn't pick up new jobs mid-shutdown), then DB / SMTP / Redis.
let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n[shutdown] ${signal} received — closing gracefully...`);

  const FORCE_EXIT_MS = 25_000;
  const killer = setTimeout(() => {
    console.error("[shutdown] timeout reached, forcing exit");
    process.exit(1);
  }, FORCE_EXIT_MS).unref();

  try {
    if (server) {
      await new Promise((r) => server.close(r));
      console.log("[shutdown] http closed");
    }
    await stopWorker();
    await closeQueues();
    await closeTransporter();
    await closeRedis();
    // Mongoose closes on its own when the process exits; do it explicitly:
    const mongoose = require("mongoose");
    await mongoose.disconnect();
    console.log("[shutdown] done");
    clearTimeout(killer);
    process.exit(0);
  } catch (err) {
    console.error("[shutdown] error:", err);
    process.exit(1);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
  shutdown("uncaughtException");
});

start().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});
