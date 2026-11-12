import { notFound } from '../../../domain/errors.js';

/** Caso de uso: consultar a ficha completa do pet, com o prontuário. */
export class GetPetHandler {
  constructor({ petRepository }) {
    this.petRepository = petRepository;
  }

  async execute({ id }) {
    const pet = await this.petRepository.findById(id);
    if (!pet) throw notFound('Pet não encontrado');
    return pet;
  }
}
