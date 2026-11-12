// Testes dos casos de uso com uma porta falsa em memória (sem MongoDB).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CreatePetHandler } from '../../src/application/features/CreatePet/handler.js';
import { ListPetsHandler } from '../../src/application/features/ListPets/handler.js';
import { GetPetHandler } from '../../src/application/features/GetPet/handler.js';
import { UpdatePetHandler } from '../../src/application/features/UpdatePet/handler.js';
import { DeletePetHandler } from '../../src/application/features/DeletePet/handler.js';
import { AddMedicalRecordHandler } from '../../src/application/features/AddMedicalRecord/handler.js';

function fakeRepository() {
  const items = new Map();
  let seq = 0;
  return {
    items,
    insert: async (pet) => { const saved = { ...pet, id: String(++seq) }; items.set(saved.id, saved); return saved; },
    findById: async (id) => items.get(id) ?? null,
    list: async ({ species } = {}) => [...items.values()].filter((p) => !species || p.species === species),
    update: async (pet) => { items.set(pet.id, pet); return pet; },
    delete: async (id) => items.delete(id)
  };
}

function setup() {
  const petRepository = fakeRepository();
  const deps = { petRepository, clock: { now: () => new Date('2026-11-12T12:00:00Z') }, idGenerator: { newId: () => 'rec-1' } };
  return {
    petRepository,
    create: new CreatePetHandler(deps),
    list: new ListPetsHandler(deps),
    get: new GetPetHandler(deps),
    update: new UpdatePetHandler(deps),
    remove: new DeletePetHandler(deps),
    addRecord: new AddMedicalRecordHandler(deps)
  };
}

const input = { name: 'Mia', species: 'CAT', tutorName: 'Bruno Lima', tutorEmail: 'bruno@email.com' };

test('CRUD completo de pet pelos casos de uso', async () => {
  const h = setup();
  const created = await h.create.execute(input);
  assert.equal(created.id, '1');
  assert.equal((await h.get.execute({ id: '1' })).name, 'Mia');
  const updated = await h.update.execute({ id: '1', changes: { name: 'Mia Lima' } });
  assert.equal(updated.name, 'Mia Lima');
  assert.deepEqual(await h.remove.execute({ id: '1' }), { deleted: true, id: '1' });
  await assert.rejects(h.get.execute({ id: '1' }), (e) => e.type === 'not_found');
});

test('ListPets devolve resumo com quantidade de atendimentos e último atendimento', async () => {
  const h = setup();
  const pet = await h.create.execute(input);
  await h.addRecord.execute({ petId: pet.id, record: { vetName: 'Dra. Carla', diagnosis: 'Check-up anual' } });
  const [summary] = await h.list.execute({ species: 'cat' });
  assert.equal(summary.recordsCount, 1);
  assert.equal(summary.lastVisit, '2026-11-12T12:00:00.000Z');
  assert.equal(summary.records, undefined);
});

test('AddMedicalRecord em pet inexistente responde not_found', async () => {
  const h = setup();
  await assert.rejects(h.addRecord.execute({ petId: '99', record: { vetName: 'Dra. Carla', diagnosis: 'Check-up' } }),
    (e) => e.type === 'not_found');
});

test('UpdatePet e DeletePet em pet inexistente respondem not_found', async () => {
  const h = setup();
  await assert.rejects(h.update.execute({ id: 'x', changes: {} }), (e) => e.type === 'not_found');
  await assert.rejects(h.remove.execute({ id: 'x' }), (e) => e.type === 'not_found');
});
