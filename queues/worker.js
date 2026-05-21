// queues/worker.js
// Single BullMQ Worker that dispatches by job name. Runs in-process by default
// (server.js requires startWorker()), or as its own process via standalone-worker.js
// when you want to scale the worker independently of the API.
//
// Tune EMAIL_WORKER_CONCURRENCY in .env: each unit handles one job at a time.
// SMTP_POOL_MAX should be >= EMAIL_WORKER_CONCURRENCY so jobs aren't queued behind
// a single SMTP socket.

const { Worker } = require("bullmq");
const { QUEUE_NAMES, JOB_TYPES, BULL_PREFIX } = require("./index");
const { makeBullConnection } = require("../utils/redis");
const { handleInvoiceEmail } = require("./handlers/invoiceEmail");
const { handleAgreementEmail } = require("./handlers/agreementEmail");
const { handleOtpEmail } = require("./handlers/otpEmail");

const CONCURRENCY = parseInt(process.env.EMAIL_WORKER_CONCURRENCY || "5", 10);

let worker = null;

async function processJob(job) {
  switch (job.name) {
    case JOB_TYPES.INVOICE_EMAIL:
      return handleInvoiceEmail(job);
    case JOB_TYPES.AGREEMENT_EMAIL:
      return handleAgreementEmail(job);
    case JOB_TYPES.OTP_EMAIL:
      return handleOtpEmail(job);
    default:
      throw new Error(`Unknown job type: ${job.name}`);
  }
}

function startWorker() {
  if (worker) return worker;

  worker = new Worker(QUEUE_NAMES.EMAIL, processJob, {
    connection: makeBullConnection(),
    prefix: BULL_PREFIX,
    concurrency: CONCURRENCY,
    // Limit how many jobs we ack/process per second to avoid overwhelming SMTP.
    limiter: { max: 30, duration: 1000 },
  });

  worker.on("completed", (job, result) => {
    console.log(`[worker] ✅ ${job.name} #${job.id} done`, result || "");
  });
  worker.on("failed", (job, err) => {
    console.error(
      `[worker] ❌ ${job?.name} #${job?.id} failed (attempt ${job?.attemptsMade}/${job?.opts?.attempts}):`,
      err?.message
    );
  });
  worker.on("error", (err) => {
    console.error("[worker] error:", err?.message);
  });

  console.log(`[worker] started — concurrency=${CONCURRENCY}`);
  return worker;
}

async function stopWorker() {
  if (!worker) return;
  console.log("[worker] draining...");
  await worker.close();
  worker = null;
}

module.exports = { startWorker, stopWorker };
