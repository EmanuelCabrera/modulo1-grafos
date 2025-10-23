#!/usr/bin/env node
const { runLoop } = require('./src/cli/menu');
const { closeDriver } = require('./src/db/neo4j');
require('dotenv').config();

(async () => {
  try {
    await runLoop();
  } finally {
    await closeDriver();
    process.exit(0);
  }
})();
