import { asyncRoute } from '../../http/asyncRoute.js';

/** POST /pets/{id}/records */
export function register(router, handler) {
  router.post('/pets/:id/records', asyncRoute(async (req, res) => {
    const result = await handler.execute({ petId: req.params.id, record: req.body ?? {} });
    res.status(201).json(result);
  }));
}
