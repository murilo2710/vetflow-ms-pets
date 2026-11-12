import { notFound } from '../../../domain/errors.js';

/** Caso de uso: remover o pet e o seu prontuário. */
export class DeletePetHandler {
  constructor({ petRepository }) {
    this.petRepository = petRepository;
  }

  async execute({ id }) {
    const removed = await this.petRepository.delete(id);
    if (!removed) throw notFound('Pet não encontrado');
    return { deleted: true, id };
  }
}
