// services/agreement.service.js
const PDFDocument = require("pdfkit");

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function generateUserAgreementBuffer(submission, ipAddress) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: "A4", margin: 55 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const blue = "#1F3B77";
    const gray = "#333";
    const lightGray = "#555";
    const bold = "Helvetica-Bold";
    const regular = "Helvetica";
    const normal = 11;
    const leftMargin = 60;
    const width = 480;
    const agreementDate = formatDate(new Date());
    const { fullName, email, mobile } = submission;

    // ================= HEADER (only first page) =================
    const headerHeight = 100;
    doc.rect(0, 0, doc.page.width, headerHeight).fill(blue);
    doc.fill("#fff").font(bold).fontSize(14).text("Stock Mantra Pvt Ltd", leftMargin, 22);
    doc.font(regular).fontSize(10)
      .text("SEBI Registered Research Analyst", leftMargin, 40)
      .text("Registration No. INH000015534", leftMargin, 52)
      .text("Compliance with SEBI (Research Analyst) Regulations, 2014", leftMargin, 64);
    doc.moveDown(3);

    // ================= TITLE =================
    doc.fillColor(blue).font(bold).fontSize(18).text("USER AGREEMENT", leftMargin, 110);
    doc.font(regular).fontSize(12).fillColor("#000")
      .text("Terms and Conditions of Research Services", leftMargin);
    doc.moveTo(leftMargin, doc.y + 4).lineTo(leftMargin + width, doc.y + 4).strokeColor(blue).lineWidth(1).stroke();

    // ================= CLIENT INFO =================
    doc.moveDown(1.5);
    doc.fillColor(blue).font(bold).fontSize(13).text("CLIENT INFORMATION:", leftMargin);
    const boxTop = doc.y + 5;
    doc.rect(leftMargin, boxTop, width, 70).stroke();
    doc.font(regular).fillColor(gray).fontSize(normal)
      .text(`Full Name: ${fullName}`, leftMargin + 10, boxTop + 10)
      .text(`Email: ${email}`, leftMargin + 10, boxTop + 28)
      .text(`Mobile: ${mobile}`, leftMargin + 10, boxTop + 46);
    doc.moveDown(5);
    doc.text(`Agreement Date: ${agreementDate}`, leftMargin);
    doc.moveDown(0.8);

    // ================= HELPERS =================
    function heading(title) {
      doc.moveDown(1);
      doc.fillColor(blue).font(bold).fontSize(13).text(title, leftMargin);
      doc.moveTo(leftMargin, doc.y + 2).lineTo(leftMargin + width, doc.y + 2).strokeColor(blue).lineWidth(1).stroke();
      doc.moveDown(0.6);
    }

    function section(title, content) {
      if (title) doc.fillColor(blue).font(bold).fontSize(11).text(title, leftMargin);
      doc.font(regular).fillColor(gray).fontSize(normal)
        .text(content, leftMargin, doc.y + 2, { align: "justify", width, lineGap: 2 });
    //   if (doc.y > 720) { doc.addPage(); addFooter(); }
    }

    function addFooter() {
      const footerY = 780;
      doc.fontSize(9).fillColor(lightGray)
        .text("Stock Mantra Pvt Ltd • support@stockmantra.com • +91-9049800505",
          leftMargin, footerY - 25, { width, align: "center" });
      doc.text("Website: https://stockmantra.com/", leftMargin, footerY - 12, { width, align: "center" });
    }

    // ================= PAGE 1 =================
    heading("TERMS AND CONDITIONS:");
    doc.font(regular).fillColor(gray).fontSize(normal).text(
      "Parties to these Terms and Conditions:\n\n" +
      "i. Research Analyst: Stock Mantra Pvt Ltd., a SEBI Registered Research Analyst (INH000015534), with its registered office at Renuka Shobha FI 604 Sno., Chinchwad, Pune, Maharashtra.\n\n" +
      "ii. Client: The individual subscribing to or availing research services provided by the Research Analyst, hereinafter referred to as the 'Client'.",
      leftMargin, doc.y, { width, align: "justify", lineGap: 2 }
    );

    section(
      "1. Availing The Services:",
      "The Client hereby accepts the research services and confirms to avail the same at their discretion. The Research Analyst agrees to provide such services in accordance with SEBI (Research Analyst) Regulations, 2014."
    );

    section(
      "2. Obligations on RA and Client:",
      "Both the Client and RA shall comply with all applicable SEBI regulations, circulars, and amendments issued from time to time."
    );

    addFooter();

    // ================= PAGE 2 =================
    // doc.addPage();

 // PAGE 2
// doc.addPage();

section(
  "3. Client Information and KYC:",
  "The client is bound, upon acceptance of services, to submit all requisite documents as requested by the research analyst and help the RA to complete the KYC process. " +
  "The client hereby gives consent to the research analyst to fetch his KYC documents from the KYC Registration Agency (KRA)."
);

section(
  "4. Standard Terms of Service:",
  "The Client acknowledges and gives his consent to be bound by the terms set forth herewith, as well as any applicable amendments or updates provided by the Research Analyst.\n\n" +
  "The client hereby agrees:\n" +
  "1. I have read and understood the terms and conditions applicable to a research analyst as defined under regulation 2(1)(u) of the SEBI (Research Analyst) Regulations, 2014, including the fee structure.\n" +
  "2. I am subscribing to the research services for my own benefit and consumption, and any reliance placed on the research report provided by the Research Analyst shall be based on my own judgment and assessment of the conclusions contained in the research report.\n\n" +
  "I understand that:\n" +
  "i. Any investment made based on the recommendations in the research report is subject to market risk.\n" +
  "ii. Recommendations in the research report do not provide any assurance of returns.\n" +
  "iii. There is no recourse to claim any losses incurred on investments made based on the recommendations in the research report.\n\n" +
  "Declaration by Research Analyst:\n" +
  "1. It is duly registered with SEBI as an RA having Registration No.: INH000015534, Date of Registration: Mar 19, 2024.\n" +
  "2. It has registration and qualifications required to render the services contemplated under the RA Regulations, and the same are valid and subsisting.\n" +
  "3. The services provided by the RA do not conflict with or violate any provision of law, rule, regulation, contract, or other instrument to which it is a party or to which any of its property is or may be subject.\n" +
  "4. The maximum fee that may be charged by the RA is Rs.1.51 lakhs per annum per family of clients.\n" +
  "5. The recommendations provided by the RA do not provide any assurance of returns.\n" +
  "6. The RA is not engaged in any additional professional or business activities on a full-time or executive capacity that may interfere with or influence the independence of the research report and/or recommendations."
);

section(
  "5. Consideration and Mode of Payment:",
  "1. The client shall duly pay the fees to the RA of the invoice raised or for any agreed amount either written/oral within 2 days.\n" +
  "2. The Client agrees to make all payments via: UPI/Net banking/Payment Gateway or any other verified banking channel. Client shall not pay any fees in cash.\n" +
  "3. The Client hereby agrees to pay the fees in the Bank account of Research Analyst only. The RA shall not be liable for any payment made to third party account."
);

section(
  "6. Risk Factors:",
  "The Client understands that the services provided by the Research Analyst involve inherent risks, and the Client agrees to bear full responsibility for any financial or other consequences arising from the use of these services.\n\n" +
  "Investment in the market is subject to market risk, and is also subject to the following:\n" +
  "1. Trading in equities, derivatives, and other securities are subject to market risks and there is no assurance or guarantee of returns.\n" +
  "2. Past performance does not indicate future performance.\n" +
  "3. Research recommendations may not always be profitable, as actual market movements may differ from anticipated trends.\n" +
  "4. The Research Analyst is not responsible or liable for any losses resulting from research recommendations.\n" +
  "5. Investment in securities market are subject to market risks. Read all the related documents carefully before investing.\n" +
  "6. Registration granted by SEBI, membership of BASL, and certification from NISM do not guarantees the performance of the intermediary or provide any assurance of returns to investors."
);


    // addFooter();

    // ================= PAGE 3 =================
    // doc.addPage();
   section(
  "7. Conflict of Interest:",
  "The RA shall adhere to the applicable regulations/circulars/directions specified by SEBI from time to time in relation to disclosure and mitigation of any actual or potential conflict of interest. Some of disclosures are as follows:\n\n" +
  "1. The Research Analyst or any of its officer/employee does not trade in securities which are subject matter of recommendation.\n" +
  "2. There are no actual or potential conflicts of interest arising from any connection to or association with any issuer of products/securities, including any material information or facts that might compromise its objectivity or independence in the carrying on of Research Analyst services. Such conflict of interest shall be disclosed to the client as and when they arise.\n" +
  "3. Research Analyst or its employee or its associates have not received any compensation from the company which is subject matter of recommendation.\n\n" +
  "Client is advised to refer the detailed disclosure provided on our website."
);

section(
  "8. Termination of Service and Refund of Fees:",
  "The Agreement may be terminated by the client, if the Research Analyst fails to provide the research recommendations. However, the client cannot terminate the agreement solely based on not achieving the desired returns or incurring the losses from trading on the recommendations or the client discontinues the services without a valid reason, or in case of force majeure.\n\n" +
  "The RA may suspend or terminate rendering of research services to client on account of suspension/cancellation of registration of RA by SEBI and shall refund the residual amount to the client.\n\n" +
  "In case of suspension of certificate of registration of the RA for more than 60 (sixty) days or cancellation of the RA registration, RA shall refund the fees, on a pro rata basis for the period from the effective date of cancellation/suspension to end of the subscription period."
);

section(
  "9. Grievance Redressal:",
  "In the event of grievances related to non-receipt of the research report, missing content, or deficiencies in services, the Client may raise a grievance. The Research Analyst will ensure Redressal within 7 days of such complaint.\n\n" +
  "The client is required to follow the following procedure for any grievance:\n\n" +
  "Step 1: The client should first contact the RA at the contact details mentioned below:\n" +
  "Contact No.: 9049800505\n" +
  "Mail ID: support@stockmantra.com\n\n" +
  "Step 2: In case, if the client is unsatisfied, he can lodge a complaint with the SEBI through SEBI's SCORES platform at www.scores.sebi.gov.in.\n" +
  "Step 3: The client can also consider to seek resolution through the Online Dispute Resolution (ODR) mechanism through SMART ODR Portal: https://smartodr.in.\n\n" +
  "DISCLAIMER: The client is strictly required to follow the procedure as mentioned above, otherwise the RA shall not be liable delay in resolution of the grievance.\n\n" +
  "NOTE: Clients are advised to read the Do's and Don'ts for dealing with the Research Analyst, as mentioned in SEBI Master Circular No. SEBI/HO/MIRSD-POD-1/P/CIR/2024/49 dated May 21, 2024, or any updates provided by SEBI in the future.\n\n" +
  "The clients are requested to go through all the Disclaimers, Disclosures, Refund Policy and information as mentioned on its website."
);
    // addFooter();

    // ================= PAGE 4 =================
    // doc.addPage();
  // PAGE 4
// doc.addPage();

section(
  "10. Most Important Terms and Conditions:",
  "1. These terms and conditions, and consent thereon are for the research services provided by the Research Analyst (RA) and RA cannot execute/carry out any trade (purchase/sell transaction) on behalf of, the client. Thus, the clients are advised not to permit RA to execute any trade on their behalf.\n\n" +
  "2. The fee charged by RA to the client will be subject to the maximum of amount prescribed by SEBI/Research Analyst Administration and Supervisory Body (RAASB) from time to time (applicable only for Individual and HUF Clients).\n\n" +
  "Note:\n" +
  "2.1. The current fee limit is Rs 1,51,000/- per annum per family of client for all research services of the RA.\n" +
  "2.2. The fee limit does not include statutory charges.\n" +
  "2.3. The fee limits do not apply to a non-individual client/accredited investor.\n\n" +
  "3. RA may charge fees in advance if agreed by the client. Such advance shall not exceed the period stipulated by SEBI; presently it is one year. In case of pre-mature termination of the RA services by either the client or the RA, the client shall be entitled to seek refund of proportionate fees only for unexpired period.\n\n" +
  "4. Fees to RA may be paid by the client through any of the specified modes like cheque, online bank transfer, UPI, etc. Cash payment is not allowed. Optionally the client can make payments through Centralized Fee Collection Mechanism (CeFCoM) managed by BSE Limited (i.e. currently recognized RAASB).\n\n" +
  "5. The RA is required to abide by the applicable regulations/circulars/directions specified by SEBI and RAASB from time to time in relation to disclosure and mitigation of any actual or potential conflict of interest. The RA will endeavor to promptly inform the client of any conflict of interest that may affect the services being rendered to the client.\n\n" +
  "6. Any assured/guaranteed/fixed returns schemes or any other schemes of similar nature are prohibited by law. No scheme of this nature shall be offered to the client by the RA.\n\n" +
  "7. The RA cannot guarantee returns, profits, accuracy, or risk-free investments from the use of the RA's research services. All opinions, projections, estimates of the RA are based on the analysis of available data under certain assumptions as of the date of preparation/publication of research report.\n\n" +
  "8. Any investment made based on recommendations in research reports are subject to market risks, and recommendations do not provide any assurance of returns. There is no recourse to claim any losses incurred on the investments made based on the recommendations in the research report. Any reliance placed on the research report provided by the RA shall be as per the client's own judgement and assessment of the conclusions contained in the research report.\n\n" +
  "9. The SEBI registration, Enlistment with RAASB, and NISM certification do not guarantee the performance of the RA or assure any returns to the client.\n\n" +
  "10. For any grievances:\n" +
  "Step 1: The client should first contact the RA using the details mentioned herewith:\n" +
  "Contact No.: 9049800505\n" +
  "Mail ID: support@stockmantra.com\n" +
  "Step 2: If the resolution is unsatisfactory, the client can also lodge grievances through SEBI's SCORES platform at www.scores.sebi.gov.in\n" +
  "Step 3: The client may also consider the Online Dispute Resolution (ODR) through the Smart ODR portal at https://smartodr.in\n\n" +
  "11. Clients are required to keep contact details, including email id and mobile number/s updated with the RA at all times.\n\n" +
  "12. The RA shall never ask for the client's login credentials and OTPs for the client's Trading Account, Demat Account and Bank Account. Never share such information with anyone including RA."
);

// addFooter();

// PAGE 5
// doc.addPage();

section(
  "11. Optional Centralised Fee Collection Mechanism:",
  "There is an optional 'Centralized Fee Collection Mechanism for Investment Advisors and Research Analysts' (CeFCoM) for fee payments. The Research Analyst has presently not opted for the same and once the Research Analyst gets registered for it, then thereafter said mechanism will be available for the client."
);

section(
  "12. Confidentiality:",
  "Client shall not share any confidential information with third party without prior consent from the RA which has come to its knowledge."
);

section(
  "13. Dispute:",
  "No suit, prosecution or other legal proceeding shall lie against the Research Analyst for any damage caused or likely to be caused by anything which is done in good faith or intended to be done under the provisions of the Securities and Exchange Board of India (Research Analyst) Regulations, 2014.\n\n" +
  "Any Disputes between the parties shall be resolved through arbitration or other methods mutually agreed upon, in accordance with applicable legal and regulatory guidelines."
);

section(
  "14. Severability:",
  "If any provision of this Terms and Conditions is found to be invalid, illegal, or unenforceable, the remaining provisions will remain in full effect, provided the essential purpose of the Terms and Conditions is not undermined."
);

section(
  "15. Force Majeure:",
  "Neither party shall be held liable for failure or delay in performance under this Terms and Conditions due to circumstances beyond their reasonable control, including but not limited to natural disasters, government actions, or other unforeseen events.\n\n" +
  "The client agrees to abide with the terms and conditions of the research services."
);

// addFooter();


    // addFooter();

    // ================= PAGE 5 =================
    // doc.addPage();
    heading("CONSENT & ACCEPTANCE:");
    const consentTop = doc.y + 20;
    doc.rect(leftMargin, consentTop, width, 200).stroke();
    doc.font(regular).fillColor(gray)
      .text(`I, ${fullName}, acknowledge that I have read and agree to the complete Terms & Conditions set forth by Stock Mantra Pvt Ltd as of ${agreementDate}.`,
        leftMargin + 10, consentTop + 10, { width: width - 20, align: "justify" });
    doc.moveDown(1.2);
    doc.font(bold).text("SIGNATURE DETAILS:", leftMargin +10);
    doc.font(regular).fillColor(gray)
      .text(`Name: ${fullName}`, leftMargin+10)
      .text(`Email: ${email}, `,  leftMargin+10)
      .text(`Signed at: ${agreementDate}`,  leftMargin+10)
      .text(`IP Address: ${ipAddress || "Not Captured"}`,  leftMargin+10);

    doc.moveDown(2);
    doc.fontSize(9).fillColor(lightGray)
      .text("Note: This document contains the full Terms & Conditions. Visit https://stockmantra.com for more info.", leftMargin+10, doc.y, { width, align: "justify" });
       doc.moveDown(4);


     // === FINAL CLOSING SECTION ===
const footerTop = doc.y ;
const footerPadding = 12;
const footerBoxHeight = 95;
const footerLeft = leftMargin;
const footerWidth = width;

// Draw border box


// Inside padding text
doc.font("Helvetica-Bold")
  .fillColor("#1F3B77")
  .fontSize(12)
  .text("Stock Mantra Pvt Ltd.", footerLeft + footerPadding, footerTop + footerPadding);

doc.font("Helvetica")
  .fillColor("#333")
  .fontSize(10)
  .text("SEBI Registration No. INH000015534", footerLeft + footerPadding, doc.y + 3)
  .text("Email: support@stockmantra.com", footerLeft + footerPadding, doc.y + 3)
  .text("Phone: +91-9049800505", footerLeft + footerPadding, doc.y + 3)
  .text("Website: https://stockmantra.com/", footerLeft + footerPadding, doc.y + 3);

doc.moveDown(2);
doc.font("Helvetica-Bold")
  .fillColor("#1F3B77")
  .fontSize(11)
  .text("Thank you for choosing Stock Mantra", footerLeft + footerPadding, doc.y + 5);

doc.font("Helvetica")
  .fillColor("#555")
  .fontSize(9)
  .text("This agreement is legally binding and enforceable.", footerLeft + footerPadding, doc.y + 2);
   




    addFooter();

    doc.end();
  });
}

module.exports = { generateUserAgreementBuffer };
