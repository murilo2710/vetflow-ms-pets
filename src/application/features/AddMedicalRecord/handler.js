import { notFound } from '../../../domain/errors.js';
import { addMedicalRecord } from '../../../domain/pet.js';

/** Caso de uso: registrar atendimento no prontuário do pet (RF10). */
export class AddMedicalRecordHandler {
  constructor({ petRepository, clock, idGenerator }) {
    this.petRepository = petRepository;
    this.clock = clock;
    this.idGenerator = idGenerator;
  }

  async execute({ petId, record }) {
    const pet = await this.petRepository.findById(petId);
    if (!pet) throw notFound('Pet não encontrado');
    const result = addMedicalRecord(pet, record, this.clock.now(), this.idGenerator.newId());
    const saved = await this.petRepository.update(result.pet);
    return { record: result.record, pet: saved };
  }
}
