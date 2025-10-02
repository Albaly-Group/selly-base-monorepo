// Load .env.test file for E2E tests
const dotenv = require('dotenv');
const path = require('path');

// Load .env.test from apps/api directory
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
