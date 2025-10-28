const { getSession, neo4j } = require('../db/neo4j');

const PersonaRepository = {
  async createOrUpdate({ id, name, city, age, hobby }) {
    const session = getSession('WRITE');
    try {
      // MERGE: Busca un nodo Person con el ID dado, si no existe lo crea
      // ON CREATE: Si es nuevo, establece todos los campos y timestamp de creación
      // ON MATCH: Si existe, actualiza solo los campos que no son null (coalesce)
      const res = await session.run(
        `MERGE (p:Person {id: $id})
         ON CREATE SET p.name = $name, p.city = $city, p.age = $age, p.hobby = $hobby, p.createdAt = datetime()
         ON MATCH SET  p.name = coalesce($name, p.name), p.city = coalesce($city, p.city), p.age = coalesce($age, p.age), p.hobby = coalesce($hobby, p.hobby)
         RETURN p`,
        { id, name, city, age: age || null, hobby: hobby || null }
      );
      return res.records[0]?.get('p').properties;
    } finally {
      await session.close();
    }
  },

  async list(q) {
    const session = getSession('READ');
    try {
      // Búsqueda flexible: Si hay filtro (q), busca en nombre, ciudad o hobby
      // Si no hay filtro, retorna todas las personas ordenadas por nombre
      const res = await session.run(
        q
          ? `MATCH (p:Person)
             WHERE toLower(p.name) CONTAINS toLower($q)
                OR toLower(p.city) CONTAINS toLower($q)
                OR toLower(p.hobby) CONTAINS toLower($q)
             RETURN p ORDER BY p.name`
          : `MATCH (p:Person) RETURN p ORDER BY p.name`,
        { q }
      );
      return res.records.map(r => r.get('p').properties);
    } finally {
      await session.close();
    }
  },

  async deleteById(id) {
    const session = getSession('WRITE');
    try {
      // DETACH DELETE: Elimina el nodo y todas sus relaciones automáticamente
      // Evita errores de integridad referencial
      await session.run(`MATCH (p:Person {id: $id}) DETACH DELETE p`, { id });
    } finally {
      await session.close();
    }
  },

  async findByName(name) {
    const session = getSession('READ');
    try {
      // Búsqueda case-insensitive: Convierte ambos nombres a minúsculas para comparar
      // LIMIT 1: Solo retorna la primera coincidencia (debería ser única por constraint)
      const res = await session.run(
        `MATCH (p:Person) 
         WHERE toLower(p.name) = toLower($name) 
         RETURN p LIMIT 1`,
        { name }
      );
      return res.records.length > 0 ? res.records[0].get('p').properties : null;
    } finally {
      await session.close();
    }
  },

  async friendsOf(id) {
    const session = getSession('READ');
    try {
      // Búsqueda bidireccional: Encuentra amigos en ambas direcciones de la relación
      // DISTINCT: Evita duplicados cuando hay relaciones bidireccionales
      const res = await session.run(
        `MATCH (p:Person {id: $id})-[:FRIEND_WITH]-(f:Person) 
         RETURN DISTINCT f ORDER BY f.name`, 
        { id }
      );
      return res.records.map(r => r.get('f').properties);
    } finally {
      await session.close();
    }
  },

  async getCityRecommendations(personId, city) {
    const session = getSession('READ');
    try {
      // Recomendaciones por ciudad: Encuentra personas de la misma ciudad que no sean amigos
      // Excluye: a sí mismo y a sus amigos actuales
      const res = await session.run(
        `MATCH (p:Person {id: $personId})
         MATCH (recommendation:Person)
         WHERE recommendation.id <> $personId 
           AND NOT (p)-[:FRIEND_WITH]-(recommendation)
           AND recommendation.city = $city
         RETURN DISTINCT recommendation ORDER BY recommendation.name`,
        { personId, city }
      );
      return res.records.map(r => r.get('recommendation').properties);
    } finally {
      await session.close();
    }
  },

  async getHobbyRecommendations(personId, hobby) {
    const session = getSession('READ');
    try {
      // Recomendaciones por hobby: Encuentra personas con el mismo hobby que no sean amigos
      // Excluye: a sí mismo y a sus amigos actuales
      const res = await session.run(
        `MATCH (p:Person {id: $personId})
         MATCH (recommendation:Person)
         WHERE recommendation.id <> $personId 
           AND NOT (p)-[:FRIEND_WITH]-(recommendation)
           AND recommendation.hobby = $hobby
         RETURN DISTINCT recommendation ORDER BY recommendation.name`,
        { personId, hobby }
      );
      return res.records.map(r => r.get('recommendation').properties);
    } finally {
      await session.close();
    }
  },

  async getStatistics() {
    const session = getSession('READ');
    try {
      // Estadísticas completas de la red social
      
      // 1. Total de personas: Cuenta todos los nodos Person
      const peopleResult = await session.run(`MATCH (p:Person) RETURN count(p) as total`);
      const totalPeople = peopleResult.records[0].get('total').toNumber();

      // 2. Total de relaciones: Cuenta todas las relaciones FRIEND_WITH (direccionales)
      const relationsResult = await session.run(`MATCH ()-[r:FRIEND_WITH]->() RETURN count(r) as total`);
      const totalRelationships = relationsResult.records[0].get('total').toNumber();

      // 3. Ciudades únicas: Cuenta ciudades distintas (excluye nulls)
      const citiesResult = await session.run(`MATCH (p:Person) WHERE p.city IS NOT NULL RETURN count(DISTINCT p.city) as total`);
      const uniqueCities = citiesResult.records[0].get('total').toNumber();

      // 4. Hobbies únicos: Cuenta hobbies distintos (excluye nulls)
      const hobbiesResult = await session.run(`MATCH (p:Person) WHERE p.hobby IS NOT NULL RETURN count(DISTINCT p.hobby) as total`);
      const uniqueHobbies = hobbiesResult.records[0].get('total').toNumber();

      // 5. Promedio de amigos: OPTIONAL MATCH incluye personas sin amigos (0 amigos)
      const avgResult = await session.run(
        `MATCH (p:Person)
         OPTIONAL MATCH (p)-[:FRIEND_WITH]-(friend:Person)
         WITH p, count(friend) as friendCount
         RETURN avg(friendCount) as average`
      );
      const averageFriendsValue = avgResult.records[0].get('average');
      const averageFriends = averageFriendsValue ? 
        (typeof averageFriendsValue.toNumber === 'function' ? averageFriendsValue.toNumber() : Number(averageFriendsValue)) : 
        0;

      // 6. Persona más conectada: Encuentra quien tiene más amigos
      const mostConnectedResult = await session.run(
        `MATCH (p:Person)
         OPTIONAL MATCH (p)-[:FRIEND_WITH]-(friend:Person)
         WITH p, count(friend) as friendCount
         ORDER BY friendCount DESC
         LIMIT 1
         RETURN p.name as name, friendCount`
      );
      const mostConnectedRecord = mostConnectedResult.records[0];
      const mostConnectedPerson = mostConnectedRecord ? 
        `${mostConnectedRecord.get('name')} (${mostConnectedRecord.get('friendCount')} amigos)` : 
        null;

      return {
        totalPeople,
        totalRelationships,
        uniqueCities,
        uniqueHobbies,
        averageFriends,
        mostConnectedPerson
      };
    } finally {
      await session.close();
    }
  },

};

module.exports = PersonaRepository;