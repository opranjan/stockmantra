// middleware/rateLimit.js
// Three tiers:
//   global  — soft cap on all /api/* traffic (DDoS protection)
//   submit  — strict cap on the expensive POST /api/submit
//   otp     — strict cap on /api/otp/send (prevents SMTP abuse)
//
// Redis-backed so limits work across multiple Node instances behind a load balancer.

const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default || require("rate-limit-redis");
const { redis, REDIS_KEY_PREFIX } = require("../utils/redis");

// Project-scoped store prefix keeps counters isolated when sharing Redis
// with other apps (e.g. "stockmantra:rl:global:1.2.3.4").
function makeStore(suffix) {
  return new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: `${REDIS_KEY_PREFIX}:rl:${suffix}:`,
  });
}

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300, // 300 req / min / IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: makeStore("global"),
  message: { ok: false, message: "Too many requests, please slow down." },
});

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10, // 10 submits / min / IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: makeStore("submit"),
  message: { ok: false, message: "Too many submissions. Try again in a minute." },
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5, // 5 OTP requests / min / IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: makeStore("otp"),
  message: { ok: false, message: "Too many OTP requests. Try again in a minute." },
});

module.exports = { globalLimiter, submitLimiter, otpLimiter };
