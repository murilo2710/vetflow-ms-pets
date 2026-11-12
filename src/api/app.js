import express from 'express';
import { cors, requestLog } from './http/middlewares.js';
import { errorHandler, notFoundHandler } from './http/errors.js';
import { registerDocs } from './http/docs.js';
import { openapi } from './openapi.js';
import * as CreatePet from './features/CreatePet/endpoint.js';
import * as ListPets from './features/ListPets/endpoint.js';
import * as GetPet from './features/GetPet/endpoint.js';
import * as UpdatePet from './features/UpdatePet/endpoint.js';
import * as DeletePet from './features/DeletePet/endpoint.js';
import * as AddMedicalRecord from './features/AddMedicalRecord/endpoint.js';

/**
 * Monta a aplicação HTTP. Recebe os casos de uso já construídos pelo composition root
 * (src/main.js): a camada API não conhece banco nem implementações concretas.
 */
export function createApp({ handlers, health, corsOrigin = '*', serviceName = 'vetflow-ms-pets' }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(requestLog(serviceName));
  app.use(cors(corsOrigin));
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', async (req, res) => {
    try {
      await health();
      res.json({ status: 'ok', service: serviceName });
    } catch (e) {
      res.status(503).json({ status: 'unavailable', service: serviceName, reason: e.message });
    }
  });
  registerDocs(app, openapi);

  const router = express.Router();
  ListPets.register(router, handlers.listPets);
  CreatePet.register(router, handlers.createPet);
  GetPet.register(router, handlers.getPet);
  UpdatePet.register(router, handlers.updatePet);
  DeletePet.register(router, handlers.deletePet);
  AddMedicalRecord.register(router, handlers.addMedicalRecord);
  app.use(router);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
