# Backend scaling notes

## What changed

The submit + agreement + OTP endpoints used to do PDF rendering and SMTP delivery
*inline*. A single Hostinger SMTP handshake is ~500ms and PDF rendering is
~200-400ms — so under load the Node event loop stalled and connections piled up.

Now:

| Endpoint | Inline work | Queued work (async) |
|---|---|---|
| `POST /api/submit` | validate + Cloudinary upload (parallel) + Mongo insert | invoice PDF render + email send |
| `POST /api/send-agreement` | Mongo lookup | agreement PDF render + email send |
| `POST /api/otp/send` | Redis set | OTP email send |

Queue: **BullMQ on Redis**, in-process worker by default. Jobs retry 5x with
exponential backoff, completed/failed records auto-trim.

## Install

```bash
cd backend
npm install
cp .env.example .env   # fill in real values
```

Make sure Redis is reachable at `REDIS_URL` (default `redis://127.0.0.1:6379`).

## Run

```bash
# API + in-process worker (default)
npm start

# Dev mode with reload
npm run dev

# Worker as a separate process (when you also set RUN_WORKER_IN_PROCESS=false on the API)
npm run worker
```

## Tuning knobs (.env)

| Var | Default | Notes |
|---|---|---|
| `EMAIL_WORKER_CONCURRENCY` | 5 | Jobs processed in parallel per worker |
| `SMTP_POOL_MAX` | 5 | SMTP sockets reused. Keep `>= EMAIL_WORKER_CONCURRENCY`. |
| `SMTP_RATE_PER_SEC` | 10 | Hard cap to avoid Hostinger throttling |
| `RUN_WORKER_IN_PROCESS` | true | Set `false` when running `npm run worker` separately |

## Scaling further

- **Vertical:** raise `EMAIL_WORKER_CONCURRENCY` + `SMTP_POOL_MAX` together. SMTP
  becomes the bottleneck above ~30/s on Hostinger shared SMTP.
- **Horizontal:** deploy N copies of the API (load-balanced) + M worker boxes
  (`npm run worker`). They share one Redis. Rate-limit counters are Redis-backed
  so limits hold across instances.
- **Cluster mode:** wrap server.js with `pm2 start server.js -i max` (use cluster
  mode of PM2) for multi-core utilisation on a single box.

## Observability

- `GET /api/health` — liveness
- `GET /api/queue/stats` — `{ waiting, active, completed, failed, delayed }`
- `GET /api/queue/job/:id` — status + progress + retry count for a single job

In production, put these behind auth.

## Failure modes

- **Redis down**: `/api/submit` will 500 (job can't enqueue). The submission is
  *not* saved in that case — we enqueue inside the same try block so the user
  knows to retry.
- **SMTP flaky**: job retries 5x over ~5 minutes. User gets a 201 immediately;
  email lands when SMTP recovers. Check `failed` count in `/api/queue/stats`.
- **PDF render bug**: failed job kept for 7 days in Redis for inspection via
  `/api/queue/job/:id`.

## What still runs inline (and why)

- **Cloudinary upload** — the response needs to return the document URLs to the
  client, so we can't queue this without changing the API contract.
- **Mongo insert** — needs to return the saved doc to the client.

Both are I/O-bound, parallelised (`Promise.all`), and well under 3s combined.
