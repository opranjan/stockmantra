const cors = require("cors");

// Allow ALL origins (no cookies). If you need credentials, change as noted.
const corsAll = () => cors();

module.exports = { corsAll };
