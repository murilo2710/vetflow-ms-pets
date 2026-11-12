import { asyncRoute } from '../../http/asyncRoute.js';

/** PUT /pets/{id} */
export function register(router, handler) {
  router.put('/pets/:id', asyncRoute(async (req, res) => {
    res.json(await handler.execute({ id: req.params.id, changes: req.body ?? {} }));
  }));
}
