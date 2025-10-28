const { getSession, neo4j } = require('../db/neo4j');

const PersonaRepository = {
  async createOrUpdate({ id, name, city, age, hobby }) {
    const session = getSession('WRITE');
    try {
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
      await session.run(`MATCH (p:Person {id: $id}) DETACH DELETE p`, { id });
    } finally {
      await session.close();
    }
  },

  async findByName(name) {
    const session = getSession('READ');
    try {
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
      // Total de personas
      const peopleResult = await session.run(`MATCH (p:Person) RETURN count(p) as total`);
      const totalPeople = peopleResult.records[0].get('total').toNumber();

      // Total de relaciones
      const relationsResult = await session.run(`MATCH ()-[r:FRIEND_WITH]->() RETURN count(r) as total`);
      const totalRelationships = relationsResult.records[0].get('total').toNumber();

      // Ciudades únicas
      const citiesResult = await session.run(`MATCH (p:Person) WHERE p.city IS NOT NULL RETURN count(DISTINCT p.city) as total`);
      const uniqueCities = citiesResult.records[0].get('total').toNumber();

      // Hobbies únicos
      const hobbiesResult = await session.run(`MATCH (p:Person) WHERE p.hobby IS NOT NULL RETURN count(DISTINCT p.hobby) as total`);
      const uniqueHobbies = hobbiesResult.records[0].get('total').toNumber();

      // Promedio de amigos por persona
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

      // Persona con más amigos
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