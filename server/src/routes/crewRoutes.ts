import { Router, Request, Response } from 'express';
import { crewManager } from '../mission/CrewManager';
import { ActivityType, HabitatModule } from '../types';

export const crewRouter = Router();

crewRouter.get('/', (_req: Request, res: Response) => {
  const allCrew = crewManager.getAllCrew();
  res.json({ success: true, data: allCrew });
});

crewRouter.get('/:id', (req: Request, res: Response) => {
  const astro = crewManager.getAstronaut(req.params.id);
  if (astro) {
    res.json({ success: true, data: astro });
  } else {
    res.status(404).json({ success: false, error: 'Astronaut not found' });
  }
});

crewRouter.post('/:id/activity', (req: Request, res: Response) => {
  const id = req.params.id;
  const { activity, module } = req.body as { activity: ActivityType; module?: HabitatModule };
  if (!activity) {
    return res.status(400).json({ success: false, error: 'Activity is required' });
  }
  const updated = crewManager.updateCrewActivity(id, activity, module);
  if (updated) {
    res.json({ success: true, data: updated });
  } else {
    res.status(404).json({ success: false, error: 'Astronaut not found' });
  }
});
