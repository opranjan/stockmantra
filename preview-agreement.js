// preview-agreement.js
const fs = require("fs");
const path = require("path");
const { generateUserAgreementBuffer } = require("./services/agreement.service");

(async () => {
  try {
    console.log("⏳ Generating Agreement PDF preview...");

    const fakeSubmission = {
      fullName: "Akash Kumar",
      email: "akash@example.com",
      mobile: "9876543210",
    };

    const ip = "103.224.67.12"; // fake IP

    // Generate PDF Buffer
    const pdfBuffer = await generateUserAgreementBuffer(fakeSubmission, ip);

    // Save file
    const filePath = path.join(__dirname, "agreement_preview.pdf");
    fs.writeFileSync(filePath, pdfBuffer);

    console.log(`✅ PDF generated successfully: ${filePath}`);
    console.log("📂 Open it manually in File Explorer or drag into Chrome.");
  } catch (err) {
    console.error("❌ Error generating PDF:", err);
  }
})();
