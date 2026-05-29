const COMPANY = require("../config/company");

function welcomeEmailTemplate({
  name,
  email,
  mobile,
  amount,
  startDate,
  // endDate,
  invoiceNo,
}) {
  // Encode the query parameters safely
  const encodedName = encodeURIComponent(name);
  const encodedEmail = encodeURIComponent(email);
  const encodedMobile = encodeURIComponent(mobile);

   // <tr><td>End Date:</td><td><strong>${endDate}</strong></td></tr>

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













      <div style="border-left:4px solid #1A2C80; background-color:#f7f9fc; padding:20px; margin-top:20px;">
  <h4 style="color:#1A2C80; margin-top:0;">Please Note the Following Before Proceeding:</h4>

  <p><strong>Mandatory KYC:</strong> All clients are required to complete the KYC process before availing any of our services.</p>

  <p><strong>No Return Assurances:</strong> We do not promise or guarantee profits, nor do we provide assured return schemes. 
  If anyone offers such claims in our name, kindly report it immediately at <strong>+91-7977117177.</strong>.</p>

  <p><strong>Payment Safety:</strong> Service fees must be paid only to the bank account published on our official website. 
  Never transfer funds to any personal account. If such a request is made, please notify us immediately.</p>

  <p><strong>No Fund Handling or Advisory:</strong> We do not manage funds, offer PMS services, or provide Investment Advisory services under any circumstances.</p>

  <p><strong>Market Risks Exist:</strong> Investing in securities involves inherent market risks. Please use stop-loss mechanisms diligently. 
  Losses may exceed your invested capital.</p>

  <p><strong>No Compensation on Losses:</strong> Any trades taken based on our research are done solely at the client’s discretion. 
  We are not responsible for any losses, and clients shall not be entitled to seek compensation under any legal theory.</p>

  <p><strong>Refund Policy:</strong> Kindly refer to our refund policy available on 
  <a href="${COMPANY.WEBSITE}" style="color:#1A2C80;">our website</a> before making any payment.</p>
</div>

<div style="margin-top:25px; border-left:4px solid #444; background-color:#fafafa; padding:20px;">
  <h4 style="color:#444; margin-top:0;">Legal Disclaimer</h4>

  <p>Investments in securities are subject to market risks. Please read all relevant documents and disclosures carefully before investing.</p>

  <p>SEBI registration and NISM certification do not imply guaranteed performance or assured returns.</p>

  <p>We do not promote, recommend, or partner with any specific stock brokers.</p>

  <p>We do not operate, manage, or access client Demat or trading accounts.</p>

  <p>We do not offer any distribution, execution, or transaction services.</p>

  <p>We respect your privacy. No client data is shared with third parties, and we do not store card or sensitive payment information.</p>

  <p>Our research recommendations are based on thorough technical and fundamental analysis. However, these are research-based opinions only 
  and do not constitute investment advice. No accuracy or return is guaranteed.</p>

  <p>All official communication shall be conducted via WhatsApp. It is the sole responsibility of the client to review, understand, 
  and verify all information provided.</p>

  <p>If the KYC process, including completion through our website and OTP validation, has not been completed by you, 
  this email is being sent for compliance and internal record-keeping purposes.</p>

  <p>
    We are here to provide research-based opinions only. All investment decisions must be taken by clients after careful 
    consideration of their financial goals and risk appetite.
  </p>

  <p style="margin-top:15px;">
    For any queries, guidance, or support, you may reach out to us anytime.<br><br>
    <strong>We look forward to a responsible and informed investing journey together!</strong>
  </p>
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










// <div style="border-left:4px solid #1A2C80; background-color:#f7f9fc; padding:15px;">
//         <h4 style="color:#1A2C80;">Please Note:</h4>
//         <p><strong>No Return Assurances:</strong> We do not guarantee profits. Report such claims at ${COMPANY.CONTACT.REPORT_MOBILE}.</p>
//         <p><strong>Payment Safety:</strong> Pay only to our official bank account. Never to personal accounts.</p>
//         <p><strong>Refund Policy:</strong> See our refund policy on 
//         <a href="${COMPANY.WEBSITE}" style="color:#1A2C80;">our website</a>.</p>
//       </div>

//       <div style="margin-top:25px;">
//         <h3>Your Subscription Details</h3>
//         <table style="width:100%; border-collapse:collapse; margin-top:10px;">
//           <tr><td>Amount Paid:</td><td><strong>₹${amount.toFixed(2)}</strong></td></tr>
//           <tr><td>Start Date:</td><td><strong>${startDate}</strong></td></tr>
         
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
