const mongoose = require("mongoose");

function connectDB(uri) {
  return mongoose
    .connect(uri)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((e) => {
      console.error("MongoDB error:", e.message);
      process.exit(1);
    });
}

module.exports = { connectDB };
