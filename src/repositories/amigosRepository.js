const { getSession } = require('../db/neo4j');

const AmigosRepository = {
  async add(from, to) {
    const session = getSession('WRITE');
    try {
      // Verificar que ambas personas existan
      const checkResult = await session.run(
        `MATCH (a:Person {id: $from}), (b:Person {id: $to})
         RETURN count(a) as fromCount, count(b) as toCount`,
        { from, to }
      );
      
      const counts = checkResult.records[0];
      if (counts.get('fromCount').toNumber() === 0) {
        throw new Error(`Persona con ID ${from} no existe`);
      }
      if (counts.get('toCount').toNumber() === 0) {
        throw new Error(`Persona con ID ${to} no existe`);
      }
      
      // Crear relaciones bidireccionales
      await session.run(
        `MATCH (a:Person {id: $from}), (b:Person {id: $to})
         MERGE (a)-[:FRIEND_WITH]->(b)
         MERGE (b)-[:FRIEND_WITH]->(a)`,
        { from, to }
      );
      
      console.log(`✅ Relación de amistad bidireccional creada: ${from} <-> ${to}`);
    } finally {
      await session.close();
    }
  },

  async remove(from, to) {
    const session = getSession('WRITE');
    try {
      // Eliminar ambas direcciones de la relación
      const result1 = await session.run(
        `MATCH (a:Person {id: $from})-[r1:FRIEND_WITH]->(b:Person {id: $to}) 
         DELETE r1
         RETURN count(r1) as deletedCount1`,
        { from, to }
      );
      
      const result2 = await session.run(
        `MATCH (b:Person {id: $to})-[r2:FRIEND_WITH]->(a:Person {id: $from}) 
         DELETE r2
         RETURN count(r2) as deletedCount2`,
        { from, to }
      );
      
      const deletedCount1 = result1.records[0]?.get('deletedCount1').toNumber() || 0;
      const deletedCount2 = result2.records[0]?.get('deletedCount2').toNumber() || 0;
      
      if (deletedCount1 > 0 || deletedCount2 > 0) {
        console.log(`✅ Relación de amistad bidireccional eliminada: ${from} <-> ${to}`);
      } else {
        console.log(`⚠️ No se encontró relación de amistad: ${from} <-> ${to}`);
      }
    } finally {
      await session.close();
    }
  }
};

module.exports = AmigosRepository;