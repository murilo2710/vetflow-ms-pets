import { createPet } from '../../../domain/pet.js';

/** Caso de uso: cadastrar pet (RF05). */
export class CreatePetHandler {
  constructor({ petRepository, clock }) {
    this.petRepository = petRepository;
    this.clock = clock;
  }

  async execute(input) {
    const pet = createPet(input, this.clock.now());
    return this.petRepository.insert(pet);
  }
}
