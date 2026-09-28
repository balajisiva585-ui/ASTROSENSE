import { Router, Request, Response } from 'express';
import { asteroidMonitor } from '../asteroid/AsteroidMonitor';

export const asteroidRouter = Router();

asteroidRouter.get('/', (_req: Request, res: Response) => {
  const asteroids = asteroidMonitor.getAsteroids();
  res.json({ success: true, data: asteroids });
});

asteroidRouter.post('/trigger-anomaly', (req: Request, res: Response) => {
  const targetId = req.body?.id || 'ASTEROID-B07';
  const anomalyObj = asteroidMonitor.triggerAsteroidAnomaly(targetId);
  if (anomalyObj) {
    res.json({ success: true, message: 'Asteroid trajectory anomaly triggered', data: anomalyObj });
  } else {
    res.status(404).json({ success: false, error: 'Asteroid object not found' });
  }
});

asteroidRouter.post('/:id/resolve', (req: Request, res: Response) => {
  const id = req.params.id;
  const success = asteroidMonitor.resolveAsteroidAnomaly(id);
  if (success) {
    res.json({ success: true, message: `Asteroid anomaly for ${id} resolved` });
  } else {
    res.status(404).json({ success: false, error: 'Anomaly not found' });
  }
});
