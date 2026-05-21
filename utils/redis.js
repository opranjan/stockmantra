// utils/redis.js
// Shared Redis connections. BullMQ requires a connection with
// maxRetriesPerRequest=null and enableReadyCheck=false for its blocking commands.
// Everything else (rate limiter, OTP, cache) uses a normal client.

const IORedis = require("ioredis");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
// All keys this project writes will be namespaced with this prefix, so it can
// safely share a Redis instance with other apps. Pick something unique per
// project (e.g. "stockmantra"). Combined with a dedicated DB number in
// REDIS_URL (e.g. .../1), collisions are impossible.
const REDIS_KEY_PREFIX = process.env.REDIS_KEY_PREFIX || "stockmantra";

function makeClient(opts = {}) {
  const client = new IORedis(REDIS_URL, {
    lazyConnect: false,
    retryStrategy: (times) => Math.min(times * 200, 5000),
    ...opts,
  });
  client.on("error", (err) => {
    // Avoid spamming the same error; ioredis will keep reconnecting.
    if (err.code !== "ECONNREFUSED") {
      console.error("[redis] error:", err.message);
    }
  });
  return client;
}

// General-purpose client (OTP store, rate limit, cache)
const redis = makeClient();

// Dedicated connections for BullMQ (must have these flags)
function makeBullConnection() {
  return makeClient({
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

async function closeRedis() {
  try {
    await redis.quit();
  } catch (_) {
    /* ignore */
  }
}

module.exports = {
  redis,
  makeBullConnection,
  closeRedis,
  REDIS_URL,
  REDIS_KEY_PREFIX,
};
