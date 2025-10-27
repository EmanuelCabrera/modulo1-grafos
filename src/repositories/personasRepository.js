const { getSession, neo4j } = require('../db/neo4j');

const PersonaRepository = {
  async createOrUpdate({ id, name, email }) {
    const session = getSession('WRITE');
    try {
      const res = await session.run(
        `MERGE (p:Person {id: $id})
         ON CREATE SET p.name = $name, p.email = $email, p.createdAt = datetime()
         ON MATCH SET  p.name = coalesce($name, p.name), p.email = coalesce($email, p.email)
         RETURN p`,
        { id, name, email: email || null }
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
                OR toLower(p.email) CONTAINS toLower($q)
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

};

module.exports = PersonaRepository;