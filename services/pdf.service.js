const PDFDocument = require("pdfkit");

async function generateInvoiceBuffer(submission) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.font("Helvetica-Bold").fontSize(16).text("TAX INVOICE", { align: "center" });
    doc.moveDown();
    doc.font("Helvetica").fontSize(12);
    doc.text(`Invoice No: INV-${submission.txnId}`);
    doc.text(`Name: ${submission.fullName}`);
    doc.text(`Email: ${submission.email}`);
    doc.text(`Amount: ₹${submission.amount.toFixed(2)}`);
    doc.text(`Payment Date: ${submission.paymentDate}`);
    doc.text(`Agent Name: ${submission.agentName}`);
    doc.text(`PAN: ${submission.pan}`);
    doc.text(`GST NO: 46AASBD2035G1AC`);
    doc.end();
  });
}

module.exports = { generateInvoiceBuffer };
