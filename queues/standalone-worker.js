// queues/standalone-worker.js
// Optional: run the worker as a separate process when you want to scale
// PDF/email work independently of the API (e.g. `npm run worker`).
// Requires the same .env (Mongo, Redis, SMTP, Cloudinary) as the API.

require("dotenv").config();
const { connectDB } = require("../utils/db");
const { startWorker, stopWorker } = require("./worker");
const { closeQueues } = require("./index");
const { closeRedis } = require("../utils/redis");

(async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is required");
    process.exit(1);
  }
  await connectDB(process.env.MONGO_URI);
  startWorker();
  console.log("🛠  Standalone worker running. CTRL+C to stop.");
})();

async function shutdown(signal) {
  console.log(`\n[worker] received ${signal}, shutting down...`);
  await stopWorker();
  await closeQueues();
  await closeRedis();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
