const { v4: uuidv4 } = require('uuid');
const PersonaRepository = require('../repositories/personasRepository');

const RedSocialService = {
  async registerPerson({ id, name, email }) {
    const finalId = id || uuidv4();
    return PersonaRepository.createOrUpdate({ id: finalId, name, email });
  },
  listPeople(q) {
    return PersonaRepository.list(q);
  },
  deletePerson(id) {
    return PersonaRepository.deleteById(id);
  },
};

module.exports = RedSocialService;