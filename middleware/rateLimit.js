// middleware/rateLimit.js
// Three tiers:
//   global  — soft cap on all /api/* traffic (DDoS protection)
//   submit  — strict cap on the expensive POST /api/submit
//   otp     — strict cap on /api/otp/send (prevents SMTP abuse)
//
// Redis-backed so limits work across multiple Node instances behind a load balancer.

const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default || require("rate-limit-redis");
const { redis } = require("../utils/redis");

function makeStore(prefix) {
  return new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix,
  });
}

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300, // 300 req / min / IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: makeStore("rl:global:"),
  message: { ok: false, message: "Too many requests, please slow down." },
});

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10, // 10 submits / min / IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: makeStore("rl:submit:"),
  message: { ok: false, message: "Too many submissions. Try again in a minute." },
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5, // 5 OTP requests / min / IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: makeStore("rl:otp:"),
  message: { ok: false, message: "Too many OTP requests. Try again in a minute." },
});

module.exports = { globalLimiter, submitLimiter, otpLimiter };
