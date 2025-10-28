const { getSession, closeDriver } = require('./db/neo4j');

(async () => {
  const session = getSession('WRITE');
  try {
    // Eliminar índices y constraints existentes que puedan conflictuar
    await session.run(`DROP INDEX person_name IF EXISTS`);
    await session.run(`DROP INDEX person_email IF EXISTS`);
    await session.run(`DROP CONSTRAINT person_name_unique IF EXISTS`);
    
    // Crear constraints
    await session.run(`CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE`);
    // Constraint case-insensitive para nombres únicos
    await session.run(`CREATE CONSTRAINT person_name_unique_case_insensitive IF NOT EXISTS FOR (p:Person) REQUIRE toLower(p.name) IS UNIQUE`);
    
    // Crear índices adicionales
    await session.run(`CREATE INDEX person_city IF NOT EXISTS FOR (p:Person) ON (p.city)`);
    await session.run(`CREATE INDEX person_hobby IF NOT EXISTS FOR (p:Person) ON (p.hobby)`);
    
    console.log('✔ Constraints/Índices listos.');
  } catch (e) {
    console.error('✖ Error creando constraints/índices:', e.message);
    process.exitCode = 1;
  } finally {
    await session.close();
    await closeDriver();
  }
})();
