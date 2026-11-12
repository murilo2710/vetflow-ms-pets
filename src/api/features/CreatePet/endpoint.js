import { asyncRoute } from '../../http/asyncRoute.js';

/** POST /pets */
export function register(router, handler) {
  router.post('/pets', asyncRoute(async (req, res) => {
    const pet = await handler.execute(req.body ?? {});
    res.status(201).location(`/pets/${pet.id}`).json(pet);
  }));
}
