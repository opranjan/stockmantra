// services/cloudinary.service.js
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload buffer (from multer.memoryStorage)
async function uploadToCloudinary(buffer, filename, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder || "submissions",
        public_id: filename.replace(/\.[^/.]+$/, ""), // remove file extension
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({
          public_id: result.public_id,
          url: result.secure_url,
          format: result.format,
          bytes: result.bytes,
          resource_type: result.resource_type,
        });
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const stream = require("stream");
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
}

module.exports = { uploadToCloudinary };
