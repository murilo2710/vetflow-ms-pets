// Entidade Pet e regras do prontuário. Código puro: sem banco, sem HTTP, sem bibliotecas.
import { validation } from './errors.js';

export const Species = Object.freeze({ DOG: 'DOG', CAT: 'CAT', OTHER: 'OTHER' });
export const MAX_WEIGHT_KG = 150;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const text = (v) => (typeof v === 'string' ? v.trim() : v);

function check(errors, field, ok, message) {
  if (!ok) errors[field] = message;
}

function validatePetFields(data, now) {
  const errors = {};
  check(errors, 'name', typeof data.name === 'string' && data.name.length >= 2 && data.name.length <= 60,
    'Nome do pet é obrigatório (2 a 60 caracteres)');
  check(errors, 'species', Object.values(Species).includes(data.species),
    'Espécie deve ser DOG, CAT ou OTHER');
  check(errors, 'tutorName', typeof data.tutorName === 'string' && data.tutorName.length >= 3 && data.tutorName.length <= 100,
    'Nome do tutor é obrigatório (3 a 100 caracteres)');
  check(errors, 'tutorEmail', typeof data.tutorEmail === 'string' && EMAIL.test(data.tutorEmail),
    'E-mail do tutor inválido');
  if (data.breed != null) {
    check(errors, 'breed', typeof data.breed === 'string' && data.breed.length <= 60, 'Raça deve ter até 60 caracteres');
  }
  if (data.birthDate != null) {
    const valid = typeof data.birthDate === 'string' && DATE.test(data.birthDate) && !Number.isNaN(Date.parse(data.birthDate));
    check(errors, 'birthDate', valid, 'Data de nascimento deve estar no formato AAAA-MM-DD');
    if (valid) check(errors, 'birthDate', new Date(data.birthDate) <= now, 'Data de nascimento não pode ser futura');
  }
  if (data.weightKg != null) {
    check(errors, 'weightKg', typeof data.weightKg === 'number' && data.weightKg > 0 && data.weightKg <= MAX_WEIGHT_KG,
      `Peso deve ser maior que 0 e até ${MAX_WEIGHT_KG} kg`);
  }
  if (Object.keys(errors).length) throw validation('Dados do pet inválidos', errors);
}

function normalize(input = {}) {
  return {
    name: text(input.name),
    species: typeof input.species === 'string' ? input.species.trim().toUpperCase() : input.species,
    breed: input.breed ? text(input.breed) : null,
    birthDate: input.birthDate || null,
    weightKg: input.weightKg ?? null,
    tutorName: text(input.tutorName),
    tutorEmail: typeof input.tutorEmail === 'string' ? input.tutorEmail.trim().toLowerCase() : input.tutorEmail
  };
}

/** Cria um pet novo (ainda sem id; o id vem do repositório). */
export function createPet(input, now) {
  const data = normalize(input);
  validatePetFields(data, now);
  return { ...data, records: [], createdAt: now.toISOString(), updatedAt: now.toISOString() };
}

/** Atualiza os dados cadastrais. O prontuário (records) não muda por aqui. */
export function updatePet(existing, changes, now) {
  const data = normalize({ ...existing, ...changes });
  validatePetFields(data, now);
  return { ...existing, ...data, records: existing.records, updatedAt: now.toISOString() };
}

/**
 * Regra do prontuário: um atendimento precisa de veterinário e diagnóstico,
 * não pode ter data futura e, se trouxer peso, ele passa a ser o peso atual do pet.
 */
export function addMedicalRecord(pet, input = {}, now, newId) {
  const errors = {};
  const date = input.date ? new Date(input.date) : now;
  check(errors, 'date', !Number.isNaN(date.getTime()), 'Data do atendimento inválida');
  if (!Number.isNaN(date.getTime())) check(errors, 'date', date <= now, 'Data do atendimento não pode ser futura');
  const vetName = text(input.vetName);
  const diagnosis = text(input.diagnosis);
  const prescription = input.prescription ? text(input.prescription) : null;
  check(errors, 'vetName', typeof vetName === 'string' && vetName.length >= 3, 'Nome do veterinário é obrigatório');
  check(errors, 'diagnosis', typeof diagnosis === 'string' && diagnosis.length >= 3 && diagnosis.length <= 500,
    'Diagnóstico é obrigatório (3 a 500 caracteres)');
  if (prescription != null) check(errors, 'prescription', prescription.length <= 1000, 'Prescrição deve ter até 1000 caracteres');
  if (input.weightKg != null) {
    check(errors, 'weightKg', typeof input.weightKg === 'number' && input.weightKg > 0 && input.weightKg <= MAX_WEIGHT_KG,
      `Peso deve ser maior que 0 e até ${MAX_WEIGHT_KG} kg`);
  }
  if (input.appointmentId != null) {
    check(errors, 'appointmentId', typeof input.appointmentId === 'string' && input.appointmentId.length <= 64,
      'appointmentId inválido');
  }
  if (Object.keys(errors).length) throw validation('Dados do atendimento inválidos', errors);

  const record = {
    id: newId,
    date: date.toISOString(),
    vetName,
    diagnosis,
    prescription,
    weightKg: input.weightKg ?? null,
    appointmentId: input.appointmentId ?? null
  };
  const records = [record, ...(pet.records || [])].sort((a, b) => b.date.localeCompare(a.date));
  const weightKg = record.weightKg ?? pet.weightKg;
  return { pet: { ...pet, records, weightKg, updatedAt: now.toISOString() }, record };
}
