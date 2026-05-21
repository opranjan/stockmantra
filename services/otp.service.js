// services/otp.service.js
// Redis-backed OTP store. Redis SET with EX gives us atomic write+TTL, so we
// don't need a TTL index sweeper like the Mongo version did.
//
// Keys:
//   otp:<email>          -> 6-digit code, expires in OTP_TTL_SECONDS
//   otp:attempts:<email> -> failed verification counter, expires with the code

const { redis, REDIS_KEY_PREFIX } = require("../utils/redis");

const OTP_TTL_SECONDS = parseInt(process.env.OTP_TTL_SECONDS || "300", 10); // 5 min
const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || "5", 10);

// Project-scoped keys so we can share Redis with other apps without collisions.
const otpKey = (email) => `${REDIS_KEY_PREFIX}:otp:${email.toLowerCase()}`;
const attemptsKey = (email) =>
  `${REDIS_KEY_PREFIX}:otp:attempts:${email.toLowerCase()}`;

async function saveOtp(email, otp) {
  await redis
    .multi()
    .set(otpKey(email), otp, "EX", OTP_TTL_SECONDS)
    .del(attemptsKey(email))
    .exec();
}

/**
 * @returns {Promise<{ok: true} | {ok: false, reason: 'invalid'|'expired'|'too_many_attempts'}>}
 */
async function verifyOtp(email, otp) {
  const stored = await redis.get(otpKey(email));
  if (!stored) return { ok: false, reason: "expired" };

  if (stored !== otp) {
    const attempts = await redis.incr(attemptsKey(email));
    // Make sure the counter expires with the OTP
    if (attempts === 1) await redis.expire(attemptsKey(email), OTP_TTL_SECONDS);
    if (attempts >= MAX_ATTEMPTS) {
      await redis.del(otpKey(email), attemptsKey(email));
      return { ok: false, reason: "too_many_attempts" };
    }
    return { ok: false, reason: "invalid" };
  }

  await redis.del(otpKey(email), attemptsKey(email));
  return { ok: true };
}

async function clearOtp(email) {
  await redis.del(otpKey(email), attemptsKey(email));
}

module.exports = { saveOtp, verifyOtp, clearOtp, OTP_TTL_SECONDS };
