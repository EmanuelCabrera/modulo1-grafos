#!/usr/bin/env node
const { runLoop } = require('./src/cli/menu');
const { closeDriver } = require('./src/db/neo4j');
require('dotenv').config();

console.log('🔍 [DEBUG] Iniciando aplicación desde index.js');

(async () => {
  try {
    console.log('🔍 [DEBUG] Llamando a runLoop() desde index.js');
    await runLoop();
    console.log('🔍 [DEBUG] runLoop() completado en index.js');
  } catch (error) {
    console.log('🔍 [DEBUG] Error en index.js:', error.message);
    console.error(error);
  } finally {
    console.log('🔍 [DEBUG] Cerrando driver de Neo4j...');
    await closeDriver();
    console.log('🔍 [DEBUG] Driver cerrado, terminando proceso...');
    process.exit(0);
  }
})();
