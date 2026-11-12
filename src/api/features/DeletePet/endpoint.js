import { asyncRoute } from '../../http/asyncRoute.js';

/** DELETE /pets/{id} */
export function register(router, handler) {
  router.delete('/pets/:id', asyncRoute(async (req, res) => {
    await handler.execute({ id: req.params.id });
    res.status(204).end();
  }));
}
