#!/usr/bin/env node
const { runLoop } = require('./src/cli/menu');
const { closeDriver } = require('./src/db/neo4j');
require('dotenv').config();

(async () => {
  try {
    await runLoop();
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await closeDriver();
    process.exit(0);
  }
})();
