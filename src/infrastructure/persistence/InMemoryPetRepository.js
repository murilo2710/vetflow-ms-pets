import { randomBytes } from 'node:crypto';

const clone = (v) => structuredClone(v);

/**
 * Adaptador em memória da porta PetRepository (desenvolvimento local e testes).
 * Gera ids no mesmo formato do MongoDB (24 caracteres hexadecimais).
 */
export class InMemoryPetRepository {
  constructor(seed = []) {
    this.items = new Map(seed.map((p) => [p.id, clone(p)]));
  }

  async insert(pet) {
    const id = randomBytes(12).toString('hex');
    const saved = { ...clone(pet), id };
    this.items.set(id, saved);
    return clone(saved);
  }

  async findById(id) {
    const pet = this.items.get(id);
    return pet ? clone(pet) : null;
  }

  async list({ tutorEmail, species, search } = {}) {
    return [...this.items.values()]
      .filter((p) => !tutorEmail || p.tutorEmail === tutorEmail)
      .filter((p) => !species || p.species === species)
      .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(clone);
  }

  async update(pet) {
    this.items.set(pet.id, clone(pet));
    return clone(pet);
  }

  async delete(id) {
    return this.items.delete(id);
  }

  async ping() {
    return true;
  }
}
