import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPet, updatePet, addMedicalRecord } from '../../src/domain/pet.js';

const now = new Date('2026-11-12T12:00:00Z');
const valid = { name: 'Thor', species: 'dog', tutorName: 'Ana Souza', tutorEmail: ' ANA@Email.com ', weightKg: 28 };

test('createPet normaliza espécie e e-mail e começa com prontuário vazio', () => {
  const pet = createPet(valid, now);
  assert.equal(pet.species, 'DOG');
  assert.equal(pet.tutorEmail, 'ana@email.com');
  assert.deepEqual(pet.records, []);
  assert.equal(pet.createdAt, now.toISOString());
});

test('createPet recusa dados inválidos e informa cada campo', () => {
  assert.throws(() => createPet({ name: 'T', species: 'FISH', tutorName: '', tutorEmail: 'x' }, now), (e) => {
    assert.equal(e.type, 'validation');
    assert.deepEqual(Object.keys(e.details).sort(), ['name', 'species', 'tutorEmail', 'tutorName']);
    return true;
  });
});

test('createPet recusa data de nascimento futura e peso fora da faixa', () => {
  assert.throws(() => createPet({ ...valid, birthDate: '2027-01-01' }, now), /inválidos/);
  assert.throws(() => createPet({ ...valid, weightKg: 0 }, now), /inválidos/);
  assert.throws(() => createPet({ ...valid, weightKg: 151 }, now), /inválidos/);
});

test('updatePet mantém o prontuário e atualiza updatedAt', () => {
  const pet = { id: '1', ...createPet(valid, now), records: [{ id: 'r1', date: now.toISOString() }] };
  const later = new Date('2026-11-13T12:00:00Z');
  const updated = updatePet(pet, { name: 'Thor II', records: [] }, later);
  assert.equal(updated.name, 'Thor II');
  assert.equal(updated.records.length, 1);
  assert.equal(updated.updatedAt, later.toISOString());
});

test('addMedicalRecord exige veterinário e diagnóstico', () => {
  const pet = { id: '1', ...createPet(valid, now) };
  assert.throws(() => addMedicalRecord(pet, { vetName: '', diagnosis: '' }, now, 'r1'), (e) => e.type === 'validation');
});

test('addMedicalRecord recusa atendimento com data futura', () => {
  const pet = { id: '1', ...createPet(valid, now) };
  assert.throws(() => addMedicalRecord(pet, { vetName: 'Dra. Carla', diagnosis: 'Check-up', date: '2026-12-01' }, now, 'r1'),
    (e) => e.details.date.includes('futura'));
});

test('addMedicalRecord atualiza o peso atual e ordena do mais recente para o mais antigo', () => {
  let pet = { id: '1', ...createPet(valid, now) };
  pet = addMedicalRecord(pet, { vetName: 'Dra. Carla', diagnosis: 'Vacina V10', date: '2026-10-01T10:00:00Z', weightKg: 27 }, now, 'r1').pet;
  const { pet: after, record } = addMedicalRecord(pet, { vetName: 'Dr. Paulo', diagnosis: 'Otite leve', weightKg: 29 }, now, 'r2');
  assert.equal(record.id, 'r2');
  assert.equal(after.weightKg, 29);
  assert.deepEqual(after.records.map((r) => r.id), ['r2', 'r1']);
});
