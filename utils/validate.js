const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const mobileRegex = /^[6-9][0-9]{9}$/;

function validateBody(body) {
  const errors = [];
  const req = (name, pred, msg) => {
    const ok = pred(body[name]);
    if (!ok) errors.push({ field: name, message: msg });
  };

  req("fullName", (v) => typeof v === "string" && v.trim().length >= 2, "Full Name is required.");
  req("email", (v) => typeof v === "string" && /\S+@\S+\.\S+/.test(v), "Valid email required.");
  req("mobile", (v) => typeof v === "string" && mobileRegex.test(v), "Mobile must be 10 digits starting 6-9.");
  req("pan", (v) => typeof v === "string" && panRegex.test(v), "PAN format invalid.");
  req("dob", (v) => !!Date.parse(v), "Valid DOB is required.");
  req("amount", (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, "Amount must be a positive number.");
  req("paymentDate", (v) => !!Date.parse(v), "Valid payment date is required.");
  req("txnId", (v) => typeof v === "string" && v.trim(), "Transaction ID is required.");
  req("agentName", (v) => typeof v === "string" && v.trim(), "Agent name is required.");

  if (body.dob && Date.parse(body.dob)) {
    const age = (Date.now() - new Date(body.dob).getTime()) / (365.25 * 24 * 3600 * 1000);
    if (age < 18) errors.push({ field: "dob", message: "User must be at least 18 years old." });
  }

  return errors;
}

module.exports = { validateBody };
