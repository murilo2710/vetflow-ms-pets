import { asyncRoute } from '../../http/asyncRoute.js';

/** GET /pets/{id} */
export function register(router, handler) {
  router.get('/pets/:id', asyncRoute(async (req, res) => {
    res.json(await handler.execute({ id: req.params.id }));
  }));
}
