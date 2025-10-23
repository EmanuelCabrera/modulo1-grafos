const neo4j = require('neo4j-driver');
require('dotenv').config();

let driver;

function getDriver() {
  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI || 'bolt://localhost:7687',
      neo4j.auth.basic(
        process.env.NEO4J_USERNAME || 'neo4j',
        process.env.NEO4J_PASSWORD || 'testUserAdmin'
      )
    );
  }
  return driver;
}

function getSession(accessMode = 'WRITE') {
  const mode = accessMode === 'READ' ? neo4j.session.READ : neo4j.session.WRITE;
  return getDriver().session({ defaultAccessMode: mode });
}

async function closeDriver() {
  if (driver) await driver.close();
}

module.exports = { getDriver, getSession, closeDriver, neo4j };