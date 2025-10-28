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
      
      // Crear relación direccional
      await session.run(
        `MATCH (a:Person {id: $from}), (b:Person {id: $to})
         MERGE (a)-[:FRIEND_WITH]->(b)`,
        { from, to }
      );
      
      console.log(`✅ Relación de amistad creada: ${from} -> ${to}`);
    } finally {
      await session.close();
    }
  },

  async remove(from, to) {
    const session = getSession('WRITE');
    try {
      const result = await session.run(
        `MATCH (a:Person {id: $from})-[r:FRIEND_WITH]->(b:Person {id: $to}) 
         DELETE r
         RETURN count(r) as deletedCount`,
        { from, to }
      );
      
      const deletedCount = result.records[0]?.get('deletedCount').toNumber() || 0;
      if (deletedCount > 0) {
        console.log(`✅ Relación de amistad eliminada: ${from} -> ${to}`);
      } else {
        console.log(`⚠️ No se encontró relación de amistad: ${from} -> ${to}`);
      }
    } finally {
      await session.close();
    }
  }
};

module.exports = AmigosRepository;