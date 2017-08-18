// OPTIONAL: Create a file .env and put environment variables in there
// Example: MESSENGER_VALIDATION_TOKEN='this_is_my_token'
require('dotenv').config();

// App Secret can be retrieved from the App Dashboard
exports.APP_SECRET = process.env.APP_SECRET;

// Arbitrary value used to validate a webhook
exports.VALIDATION_TOKEN = process.env.MESSENGER_VALIDATION_TOKEN || "this_is_my_token";

// Generate a page access token for your page from the App Dashboard
exports.PAGE_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

// URL where the app is running (include protocol). Used to point to scripts and
// assets located at this address.
exports.SERVER_URL = process.env.SERVER_URL;

exports.DATABASE_LOCATION = process.env.DATABASE_LOCATION || 'db.json';