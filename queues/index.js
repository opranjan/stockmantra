// queues/index.js
// Centralised queue + queue-events registry. Queues are lightweight clients;
// the worker that actually drains them lives in queues/worker.js.

const { Queue, QueueEvents } = require("bullmq");
const { makeBullConnection, REDIS_KEY_PREFIX } = require("../utils/redis");

// BullMQ default key prefix is "bull". Namespacing it under our project
// prefix keeps multiple apps that share one Redis isolated.
const BULL_PREFIX = `${REDIS_KEY_PREFIX}:bull`;

const QUEUE_NAMES = {
  EMAIL: "email-jobs",
};

const JOB_TYPES = {
  INVOICE_EMAIL: "invoice-email",
  AGREEMENT_EMAIL: "agreement-email",
  OTP_EMAIL: "otp-email",
};

// Default options applied to every job we enqueue:
//  - 5 attempts with exponential backoff (covers transient SMTP/Cloudinary blips)
//  - keep last 1000 completed for visibility, 5000 failed for debugging
const DEFAULT_JOB_OPTS = {
  attempts: 5,
  backoff: { type: "exponential", delay: 5000 },
  removeOnComplete: { count: 1000, age: 24 * 3600 },
  removeOnFail: { count: 5000, age: 7 * 24 * 3600 },
};

const emailQueue = new Queue(QUEUE_NAMES.EMAIL, {
  connection: makeBullConnection(),
  prefix: BULL_PREFIX,
  defaultJobOptions: DEFAULT_JOB_OPTS,
});

// QueueEvents lets the API process observe job progress without
// being the worker itself (useful for the /api/queue-status endpoint).
const emailQueueEvents = new QueueEvents(QUEUE_NAMES.EMAIL, {
  connection: makeBullConnection(),
  prefix: BULL_PREFIX,
});

async function closeQueues() {
  await Promise.allSettled([emailQueue.close(), emailQueueEvents.close()]);
}

module.exports = {
  QUEUE_NAMES,
  JOB_TYPES,
  BULL_PREFIX,
  emailQueue,
  emailQueueEvents,
  closeQueues,
};
