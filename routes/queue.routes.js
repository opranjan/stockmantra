// routes/queue.routes.js
// Lightweight introspection endpoints. Put them behind auth in production.
const router = require("express").Router();
const { emailQueue } = require("../queues");

// Aggregate counts across all states
router.get("/queue/stats", async (_req, res) => {
  try {
    const counts = await emailQueue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed",
      "prioritized"
    );
    res.json({ ok: true, queue: "email-jobs", counts });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Status for a single job
router.get("/queue/job/:id", async (req, res) => {
  try {
    const job = await emailQueue.getJob(req.params.id);
    if (!job) return res.status(404).json({ ok: false, message: "Job not found" });
    const state = await job.getState();
    res.json({
      ok: true,
      id: job.id,
      name: job.name,
      state,
      progress: job.progress,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      returnvalue: job.returnvalue,
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

module.exports = router;
