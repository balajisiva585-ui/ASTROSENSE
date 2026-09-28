import { Router, Request, Response } from 'express';
import { db } from '../database/db';

export const astronautRouter = Router();

astronautRouter.get('/', (req: Request, res: Response) => {
  const astronautId = (req.query.id as string) || 'AST-01';
  const astro = db.getAstronaut(astronautId);
  res.json({ success: true, data: astro });
});

astronautRouter.put('/', (req: Request, res: Response) => {
  const astronautId = req.body.id || 'AST-01';
  const updated = db.updateAstronaut(astronautId, req.body);
  res.json({ success: true, data: updated });
});

astronautRouter.post('/reset', (_req: Request, res: Response) => {
  db.resetAll();
  const astro = db.getAstronaut('AST-01');
  res.json({ success: true, message: 'Astronaut state reset to baseline', data: astro });
});
