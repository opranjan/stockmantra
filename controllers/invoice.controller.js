const PDFDocument = require("pdfkit");
const Submission = require("../models/Submission");

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

async function generateInvoice(req, res) {
  try {
    const { txnId } = req.params;
    const submission = await Submission.findOne({ txnId });

    if (!submission)
      return res.status(404).json({ ok: false, message: "Submission not found" });

    const cgst = 90.0;
    const sgst = 90.0;
    const total = submission.amount;
    const baseAmount = (total - (cgst + sgst)).toFixed(2);
    const invoiceNo = `INV-${txnId}-${Date.now()}`;
    const invoiceDate = formatDate(new Date());

    // 🧾 Create document with larger margin
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Invoice_${invoiceNo}.pdf"`
    );

    doc.pipe(res);

    const pageWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const startX = doc.page.margins.left;
    let y = doc.y;
    const pad = 10; // inner padding for all boxes

    // ===== HEADER =====
    doc.rect(startX, y, pageWidth, 28).stroke();
    doc.font("Helvetica-Bold").fontSize(14).text("TAX INVOICE", 0, y + 8, {
      align: "center",
    });
    y += 28;

    // Invoice No / Date
    doc.rect(startX, y, pageWidth, 28).stroke();
    const colW = pageWidth / 2;
    doc.fontSize(10).font("Helvetica-Bold").text("Invoice No", startX + pad, y + 8);
    doc.font("Helvetica").text(invoiceNo, startX + 85, y + 8);
    doc.font("Helvetica-Bold").text("Date", startX + colW + pad, y + 8);
    doc.font("Helvetica").text(invoiceDate, startX + colW + 50, y + 8);
    y += 28;

    // ===== SUPPLIER =====
    doc.rect(startX, y, pageWidth, 28).stroke();
    doc.font("Helvetica-Bold").text("Supplier :", startX + pad, y + 8);
    y += 28;

    doc.rect(startX, y, pageWidth, 38).stroke();
    doc.font("Helvetica-Bold").text("Stock Matra Pvt Ltd.", startX + pad, y + 8);
    doc.font("Helvetica").text("PUNE , MAHARASHTRA", startX + pad, y + 22);
    y += 38;

    // GST
    doc.rect(startX, y, pageWidth, 28).stroke();
    doc.font("Helvetica-Bold").text("GST NO :", startX + pad, y + 8);
    doc.font("Helvetica").text("46AASBD2035G1AC", startX + 90, y + 8);
    y += 28;

    // ===== RECIPIENT =====
    doc.rect(startX, y, pageWidth, 50).stroke();
    doc.font("Helvetica-Bold").text("Recipient:", startX + pad, y + 8);
    doc.font("Helvetica-Bold").text(submission.fullName, startX + pad, y + 23);
    doc.font("Helvetica").text(submission.email, startX + pad, y + 38);
    y += 50;

    // ===== DESCRIPTION TABLE =====
    const tableHeaderHeight = 28;
    const tableRowHeight = 28;

    // Table header
    doc.rect(startX, y, pageWidth, tableHeaderHeight).stroke();
    const colWidths = [pageWidth * 0.45, pageWidth * 0.15, pageWidth * 0.1, pageWidth * 0.2];
    const headers = ["Description", "HSN / SAC", "Qty", "Amount"];
    let x = startX;
    doc.font("Helvetica-Bold");
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i], x + pad, y + 8, {
        width: colWidths[i],
        align: i === 3 ? "right" : "left",
      });
      x += colWidths[i];
    }
    y += tableHeaderHeight;

    // Item row
    doc.rect(startX, y, pageWidth, tableRowHeight).stroke();
    const rowValues = [
      "2 days Research Services Subscription",
      "998312",
      "1",
      baseAmount,
    ];
    x = startX;
    doc.font("Helvetica");
    for (let i = 0; i < rowValues.length; i++) {
      doc.text(rowValues[i], x + pad, y + 8, {
        width: colWidths[i],
        align: i === 3 ? "right" : "left",
      });
      x += colWidths[i];
    }
    y += tableRowHeight;

    // ===== DURATION =====
    doc.rect(startX, y, pageWidth, 28).stroke();
    doc.font("Helvetica-Bold").text("Duration", startX + pad, y + 8);
    y += 28;

    doc.rect(startX, y, pageWidth, 28).stroke();
    doc.font("Helvetica-Bold").text("Start Date", startX + pad, y + 8);
    doc.font("Helvetica").text(formatDate(submission.paymentDate), startX + 90, y + 8);
    y += 28;

    // ===== TAX SECTION =====
    const taxBoxW = pageWidth * 0.5;
    doc.rect(startX + taxBoxW, y, taxBoxW, 55).stroke();
    doc.font("Helvetica-Bold").text("CGST", startX + taxBoxW + pad, y + 10);
    doc.text(cgst.toFixed(2), startX + taxBoxW + taxBoxW - 70, y + 10, {
      width: 50,
      align: "right",
    });
    doc.font("Helvetica-Bold").text("SGST", startX + taxBoxW + pad, y + 28);
    doc.text(sgst.toFixed(2), startX + taxBoxW + taxBoxW - 70, y + 28, {
      width: 50,
      align: "right",
    });

    // Total box
    doc.rect(startX + taxBoxW, y + 55, taxBoxW, 28).stroke();
    doc.font("Helvetica-Bold").text("Total Amount", startX + taxBoxW + pad, y + 63);
    doc.text(total.toFixed(2), startX + taxBoxW + taxBoxW - 70, y + 63, {
      width: 50,
      align: "right",
    });
    y += 83;

    // ===== AMOUNT IN WORDS =====
    doc.rect(startX, y, pageWidth, 28).stroke();
    doc.font("Helvetica-Bold").text("Total Amount in Words", startX + pad, y + 8);
    doc.font("Helvetica").text("One Thousand Rupees only", startX + 190, y + 8);
    y += 28;

    // ===== IMPORTANT NOTES =====
    const noteLines = [
      "• Investments in securities are subject to market risks",
      "• We do not guarantee profits or returns",
      "• All investment decisions are at client's discretion",
      "• This is research service, not investment advice",
    ];
    doc.rect(startX, y, pageWidth, 18).stroke();
    doc.font("Helvetica-Bold").text("IMPORTANT NOTES", startX + pad, y + 5);
    y += 18;
    for (const n of noteLines) {
      doc.rect(startX, y, pageWidth, 18).stroke();
      doc.font("Helvetica").text(n, startX + pad, y + 5);
      y += 18;
    }

    // ===== PAYMENT TERMS =====
    const payLines = [
      "• Payment must be made only through official bank account",
      "• Never transfer funds to personal accounts",
      "• Report any suspicious payment requests immediately",
    ];
    doc.rect(startX, y, pageWidth, 18).stroke();
    doc.font("Helvetica-Bold").text("PAYMENT TERMS", startX + pad, y + 5);
    y += 18;
    for (const p of payLines) {
      doc.rect(startX, y, pageWidth, 18).stroke();
      doc.font("Helvetica").text(p, startX + pad, y + 5);
      y += 18;
    }

    // ===== FOOTER =====
    doc.rect(startX, y, pageWidth, 80).stroke();
    y += 4;
    doc.font("Helvetica-Bold").text("Stock Matra Pvt Ltd.", startX + pad, y);
    y += 14;
    doc.font("Helvetica").text("SEBI Registration No. INH000015534", startX + pad, y);
    y += 12;
    doc.text(
      "Email: support@stockmantra.com | Phone: +91-9049800505",
      startX + pad,
      y
    );
    y += 12;
    doc.text("Website: https://stockmantra.com/", startX + pad, y);
    y += 12;
    doc.text("Thank you for choosing Stock Mantra!", startX + pad, y);
    y += 12;
    doc.text(
      "This invoice is generated electronically and is valid without signature.",
      startX + 10,
      y +=2
    );

    doc.end();
  } catch (err) {
    console.error("Invoice generation error:", err);
    res.status(500).json({ ok: false, message: "Failed to generate invoice." });
  }
}

module.exports = { generateInvoice };
