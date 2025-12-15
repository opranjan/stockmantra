const COMPANY = require("../config/company");

function welcomeEmailTemplate({
  name,
  email,
  mobile,
  amount,
  startDate,
  endDate,
  invoiceNo,
}) {
  // Encode the query parameters safely
  const encodedName = encodeURIComponent(name);
  const encodedEmail = encodeURIComponent(email);
  const encodedMobile = encodeURIComponent(mobile);

  // Agreement link with params
  const agreementUrl = `${COMPANY.AGREEMENT.BASE_URL}?name=${encodedName}&email=${encodedEmail}&mobile=${encodedMobile}`;

  return `
  <div style="font-family: Arial, sans-serif; color: #333; line-height:1.6; max-width:700px; margin:auto; border:1px solid #ddd; border-radius:6px; overflow:hidden;">
    <div style="background-color:#1A2C80; color:white; text-align:center; padding:25px;">
      <h2 style="margin:0;">Welcome Onboard – Your Research Service Details & Disclosures</h2>
    </div>

    <div style="padding:30px;">
      <p>Dear <strong>${name}</strong>,</p>

      <p>Warm welcome by <strong>${COMPANY.NAME}</strong> – a SEBI Registered Research Analyst 
      (Registration No. <strong>${COMPANY.SEBI.REG_NO}</strong>) offering independent equity research services in compliance 
      with SEBI (Research Analyst) Regulations, 2014.</p>

      <p>We are delighted to have you on board! For more details, visit 
      <a href="${COMPANY.WEBSITE}" style="color:#1A2C80;">${COMPANY.WEBSITE}</a>.</p>

      <p>If you have questions, reach us at 
      <a href="mailto:${COMPANY.CONTACT.SUPPORT_EMAIL}" style="color:#1A2C80;">
        ${COMPANY.CONTACT.SUPPORT_EMAIL}
      </a>.</p>

      <div style="border-left:4px solid #1A2C80; background-color:#f7f9fc; padding:15px;">
        <h4 style="color:#1A2C80;">Please Note:</h4>
        <p><strong>No Return Assurances:</strong> We do not guarantee profits. Report such claims at ${COMPANY.CONTACT.REPORT_MOBILE}.</p>
        <p><strong>Payment Safety:</strong> Pay only to our official bank account. Never to personal accounts.</p>
        <p><strong>Refund Policy:</strong> See our refund policy on 
        <a href="${COMPANY.WEBSITE}" style="color:#1A2C80;">our website</a>.</p>
      </div>

      <div style="margin-top:25px;">
        <h3>Your Subscription Details</h3>
        <table style="width:100%; border-collapse:collapse; margin-top:10px;">
          <tr><td>Amount Paid:</td><td><strong>₹${amount.toFixed(2)}</strong></td></tr>
          <tr><td>Start Date:</td><td><strong>${startDate}</strong></td></tr>
          <tr><td>End Date:</td><td><strong>${endDate}</strong></td></tr>
          <tr><td>Invoice Number:</td><td><strong>${invoiceNo}</strong></td></tr>
        </table>
      </div>

      <div style="margin-top:25px; background-color:#f7f9fc; padding:20px; border-radius:6px; text-align:center;">
        <h3 style="color:#1A2C80;">Terms & Conditions Agreement</h3>
        <p>Please read the attached Terms & Conditions carefully and confirm acceptance.</p>
        <a href="${agreementUrl}" 
           style="background-color:#1A2C80; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block; margin-top:10px;">
           Review & Accept Terms & Conditions
        </a>
      </div>

      <p style="margin-top:25px;">Warm regards,</p>
      <p><strong>${COMPANY.NAME}</strong><br>
      SEBI Registered Research Analyst<br>
      Reg No. ${COMPANY.SEBI.REG_NO}<br>
      <a href="mailto:${COMPANY.CONTACT.SUPPORT_EMAIL}" style="color:#1A2C80;">
        ${COMPANY.CONTACT.SUPPORT_EMAIL}
      </a> | ${COMPANY.CONTACT.REPORT_MOBILE}
      </p>
    </div>
  </div>`;
}

module.exports = { welcomeEmailTemplate };











// function welcomeEmailTemplate({ name, email, mobile, amount, startDate, endDate, invoiceNo }) {
//   // Encode the query parameters safely
//   const encodedName = encodeURIComponent(name);
//   const encodedEmail = encodeURIComponent(email);
//   const encodedMobile = encodeURIComponent(mobile);

//   // The link includes all 3 params
//   const agreementUrl = `http://72.60.99.84/agreement?name=${encodedName}&email=${encodedEmail}&mobile=${encodedMobile}`;

//   return `
//   <div style="font-family: Arial, sans-serif; color: #333; line-height:1.6; max-width:700px; margin:auto; border:1px solid #ddd; border-radius:6px; overflow:hidden;">
//     <div style="background-color:#1A2C80; color:white; text-align:center; padding:25px;">
//       <h2 style="margin:0;">Welcome Onboard – Your Research Service Details & Disclosures</h2>
//     </div>

//     <div style="padding:30px;">
//       <p>Dear <strong>${name}</strong>,</p>

//       <p>Warm welcome by <strong>Stock Mantra Pvt Ltd.</strong> – a SEBI Registered Research Analyst 
//       (Registration No. <strong>INH000015534</strong>) offering independent equity research services in compliance 
//       with SEBI (Research Analyst) Regulations, 2014.</p>

//       <p>We are delighted to have you on board! For more details, visit 
//       <a href="https://stockmantra.com" style="color:#1A2C80;">https://stockmantra.com</a>.</p>

//       <p>If you have questions, reach us at 
//       <a href="mailto:support@stockmantra.com" style="color:#1A2C80;">support@stockmantra.com</a>.</p>

//       <div style="border-left:4px solid #1A2C80; background-color:#f7f9fc; padding:15px;">
//         <h4 style="color:#1A2C80;">Please Note:</h4>
//         <p><strong>No Return Assurances:</strong> We do not guarantee profits. Report such claims at +91-9049800505.</p>
//         <p><strong>Payment Safety:</strong> Pay only to our official bank account. Never to personal accounts.</p>
//         <p><strong>Refund Policy:</strong> See our refund policy on 
//         <a href="https://stockmantra.com" style="color:#1A2C80;">our website</a>.</p>
//       </div>

//       <div style="margin-top:25px;">
//         <h3>Your Subscription Details</h3>
//         <table style="width:100%; border-collapse:collapse; margin-top:10px;">
//           <tr><td>Amount Paid:</td><td><strong>₹${amount.toFixed(2)}</strong></td></tr>
//           <tr><td>Start Date:</td><td><strong>${startDate}</strong></td></tr>
//           <tr><td>End Date:</td><td><strong>${endDate}</strong></td></tr>
//           <tr><td>Invoice Number:</td><td><strong>${invoiceNo}</strong></td></tr>
//         </table>
//       </div>

//       <div style="margin-top:25px; background-color:#f7f9fc; padding:20px; border-radius:6px; text-align:center;">
//         <h3 style="color:#1A2C80;">Terms & Conditions Agreement</h3>
//         <p>Please read the attached Terms & Conditions carefully and confirm acceptance.</p>
//         <a href="${agreementUrl}" 
//            style="background-color:#1A2C80; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block; margin-top:10px;">
//            Review & Accept Terms & Conditions
//         </a>
//       </div>

//       <p style="margin-top:25px;">Warm regards,</p>
//       <p><strong>Stock Mantra Pvt Ltd.</strong><br>
//       SEBI Registered Research Analyst<br>
//       Reg No. INH000015534<br>
//       <a href="mailto:support@stockmantra.com" style="color:#1A2C80;">support@stockmantra.com</a> | +91-9049800505
//       </p>
//     </div>
//   </div>`;
// }

// module.exports = { welcomeEmailTemplate };
