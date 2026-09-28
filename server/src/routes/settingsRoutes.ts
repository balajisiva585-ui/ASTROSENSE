import { Router, Request, Response } from 'express';
import { db } from '../database/db';

export const settingsRouter = Router();

settingsRouter.get('/', (_req: Request, res: Response) => {
  const session = db.getSession();
  const astro = db.getAstronaut();

  res.json({
    success: true,
    data: {
      astronautId: astro.id,
      astronautName: astro.name,
      missionName: session.missionName,
      inactivityThresholdSeconds: session.inactivityThresholdSeconds,
      anomalySensitivity: session.anomalySensitivity,
      autoSyncOnRestore: session.autoSyncOnRestore,
      activeInputMode: session.activeInputMode,
    },
  });
});

settingsRouter.post('/', (req: Request, res: Response) => {
  const session = db.getSession();
  const astro = db.getAstronaut();
  const body = req.body;

  if (body.inactivityThresholdSeconds !== undefined) {
    db.updateSession(session.id, {
      inactivityThresholdSeconds: parseInt(body.inactivityThresholdSeconds, 10),
    });
  }

  if (body.anomalySensitivity) {
    db.updateSession(session.id, {
      anomalySensitivity: body.anomalySensitivity,
    });
  }

  if (body.autoSyncOnRestore !== undefined) {
    db.updateSession(session.id, {
      autoSyncOnRestore: Boolean(body.autoSyncOnRestore),
    });
  }

  if (body.astronautName || body.astronautId) {
    db.updateAstronaut(astro.id, {
      name: body.astronautName || astro.name,
    });
  }

  res.json({ success: true, message: 'Settings saved successfully' });
});
