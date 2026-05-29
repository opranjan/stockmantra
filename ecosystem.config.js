// PM2 process config for the StockMantra backend.
//
// Default deployment = ONE process: the API also runs the BullMQ worker
// in-process (RUN_WORKER_IN_PROCESS=true in .env). Start with:
//   pm2 start ecosystem.config.js
//
// To scale the worker onto its own process instead, set
// RUN_WORKER_IN_PROCESS=false in .env and start BOTH apps:
//   pm2 start ecosystem.config.js --only stockmantra-api
//   pm2 start ecosystem.config.js --only stockmantra-worker
//
// Env values are read from backend/.env by the app itself (dotenv), so this
// file intentionally does NOT duplicate secrets.
module.exports = {
  apps: [
    {
      name: "stockmantra-api",
      script: "server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork", // BullMQ in-process worker — keep a single instance
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      // Only used when RUN_WORKER_IN_PROCESS=false (separate worker process).
      name: "stockmantra-worker",
      script: "queues/standalone-worker.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
