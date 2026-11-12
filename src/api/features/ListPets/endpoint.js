import { asyncRoute } from '../../http/asyncRoute.js';

/** GET /pets?tutorEmail=&species=&search= */
export function register(router, handler) {
  router.get('/pets', asyncRoute(async (req, res) => {
    const { tutorEmail, species, search } = req.query;
    res.json(await handler.execute({ tutorEmail, species, search }));
  }));
}
