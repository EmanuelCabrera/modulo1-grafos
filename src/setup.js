const { getSession, closeDriver } = require('./db/neo4j');

(async () => {
  const session = getSession('WRITE');
  try {
    await session.run(`CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE`);
    await session.run(`CREATE INDEX person_name IF NOT EXISTS FOR (p:Person) ON (p.name)`);
    await session.run(`CREATE INDEX person_email IF NOT EXISTS FOR (p:Person) ON (p.email)`);
    console.log('✔ Constraints/Índices listos.');
  } catch (e) {
    console.error('✖ Error creando constraints/índices:', e.message);
    process.exitCode = 1;
  } finally {
    await session.close();
    await closeDriver();
  }
})();
