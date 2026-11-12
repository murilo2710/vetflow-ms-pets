// Composition root: único lugar que conhece as implementações concretas.
// Cria config, repositório (MongoDB ou memória), casos de uso e a aplicação HTTP.
import { loadConfig } from './infrastructure/config.js';
import { systemClock, uuidGenerator } from './infrastructure/system.js';
import { connectMongo, MongoPetRepository } from './infrastructure/persistence/MongoPetRepository.js';
import { InMemoryPetRepository } from './infrastructure/persistence/InMemoryPetRepository.js';
import { CreatePetHandler } from './application/features/CreatePet/handler.js';
import { ListPetsHandler } from './application/features/ListPets/handler.js';
import { GetPetHandler } from './application/features/GetPet/handler.js';
import { UpdatePetHandler } from './application/features/UpdatePet/handler.js';
import { DeletePetHandler } from './application/features/DeletePet/handler.js';
import { AddMedicalRecordHandler } from './application/features/AddMedicalRecord/handler.js';
import { createApp } from './api/app.js';

export function buildHandlers(deps) {
  return {
    createPet: new CreatePetHandler(deps),
    listPets: new ListPetsHandler(deps),
    getPet: new GetPetHandler(deps),
    updatePet: new UpdatePetHandler(deps),
    deletePet: new DeletePetHandler(deps),
    addMedicalRecord: new AddMedicalRecordHandler(deps)
  };
}

async function main() {
  const config = loadConfig();
  let petRepository;
  if (config.dbMode === 'mongo') {
    const { db } = await connectMongo(config.mongoUri, config.mongoDb);
    petRepository = new MongoPetRepository(db);
  } else {
    console.warn('[ms-pets] MONGODB_URI não definido: usando repositório em memória (somente desenvolvimento).');
    petRepository = new InMemoryPetRepository();
  }

  const deps = { petRepository, clock: systemClock, idGenerator: uuidGenerator };
  const app = createApp({
    handlers: buildHandlers(deps),
    health: () => petRepository.ping(),
    corsOrigin: config.corsOrigin,
    serviceName: config.serviceName
  });
  app.listen(config.port, () => {
    console.log(`[ms-pets] ouvindo na porta ${config.port} (banco: ${config.dbMode}) - Swagger em /docs`);
  });
}

main().catch((err) => {
  console.error('[ms-pets] falha ao iniciar:', err);
  process.exit(1);
});
