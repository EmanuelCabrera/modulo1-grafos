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
         WHERE p.name = $name 
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
        `MATCH (p:Person {id: $id})-[:FRIEND_WITH]->(f:Person) 
         RETURN f ORDER BY f.name`, 
        { id }
      );
      return res.records.map(r => r.get('f').properties);
    } finally {
      await session.close();
    }
  },

};

module.exports = PersonaRepository;