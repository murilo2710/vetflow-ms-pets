import { notFound } from '../../../domain/errors.js';
import { updatePet } from '../../../domain/pet.js';

/** Caso de uso: atualizar o cadastro do pet. */
export class UpdatePetHandler {
  constructor({ petRepository, clock }) {
    this.petRepository = petRepository;
    this.clock = clock;
  }

  async execute({ id, changes }) {
    const existing = await this.petRepository.findById(id);
    if (!existing) throw notFound('Pet não encontrado');
    const updated = updatePet(existing, changes, this.clock.now());
    return this.petRepository.update(updated);
  }
}
