const { v4: uuidv4 } = require('uuid');
const PersonaRepository = require('../repositories/personasRepository');
const AmigosRepository = require('../repositories/amigosRepository');

const RedSocialService = {
  async registerPerson({ id, name, city, age, hobby }) {
    // Validar que no exista una persona con el mismo nombre (case-insensitive)
    const existingPerson = await PersonaRepository.findByName(name);
    if (existingPerson) {
      throw new Error(`Ya existe una persona con el nombre "${name}" (sin importar mayúsculas/minúsculas)`);
    }
    
    const finalId = id || uuidv4();
    return PersonaRepository.createOrUpdate({ id: finalId, name, city, age, hobby });
  },
  listPeople(q) {
    return PersonaRepository.list(q);
  },
  deletePerson(id) {
    return PersonaRepository.deleteById(id);
  },
  async deletePersonByName(name) {
    const person = await PersonaRepository.findByName(name);
    if (!person) {
      throw new Error(`No se encontró persona: ${name}`);
    }
    await PersonaRepository.deleteById(person.id);
  },
  addFriend(fromId, toId) {
    if (fromId === toId) throw new Error('from y to no pueden ser iguales');
    return AmigosRepository.add(fromId, toId);
  },
  removeFriend(fromId, toId) {
    return AmigosRepository.remove(fromId, toId);
  },
  listFriends(id) {
    return PersonaRepository.friendsOf(id);
  },
  async findPersonByName(name) {
    return PersonaRepository.findByName(name);
  },
  async addFriendByName(fromName, toName) {
    // Buscar la persona "from"
    const fromPerson = await PersonaRepository.findByName(fromName);
    if (!fromPerson) {
      throw new Error(`No se encontró persona: ${fromName}`);
    }
    
    // Buscar la persona "to"
    const toPerson = await PersonaRepository.findByName(toName);
    if (!toPerson) {
      throw new Error(`No se encontró persona: ${toName}`);
    }
    
    // Crear la relación de amistad
    await AmigosRepository.add(fromPerson.id, toPerson.id);
  },
  async removeFriendByName(fromName, toName) {
    const fromPerson = await PersonaRepository.findByName(fromName);
    const toPerson = await PersonaRepository.findByName(toName);
    
    if (!fromPerson) {
      throw new Error(`No se encontró persona: ${fromName}`);
    }
    if (!toPerson) {
      throw new Error(`No se encontró persona: ${toName}`);
    }
    
    await AmigosRepository.remove(fromPerson.id, toPerson.id);
  },
  async listFriendsByName(name) {
    const person = await PersonaRepository.findByName(name);
    if (!person) {
      throw new Error(`No se encontró persona: ${name}`);
    }
    return PersonaRepository.friendsOf(person.id);
  },
  async getCityRecommendations(name) {
    const person = await PersonaRepository.findByName(name);
    if (!person) {
      throw new Error(`No se encontró persona: ${name}`);
    }
    return PersonaRepository.getCityRecommendations(person.id, person.city);
  },
  async getHobbyRecommendations(name) {
    const person = await PersonaRepository.findByName(name);
    if (!person) {
      throw new Error(`No se encontró persona: ${name}`);
    }
    return PersonaRepository.getHobbyRecommendations(person.id, person.hobby);
  },
  async getStatistics() {
    return PersonaRepository.getStatistics();
  },
};

module.exports = RedSocialService;