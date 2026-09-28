import { Router, Request, Response } from 'express';
import { db } from '../database/db';

export const anomalyRouter = Router();

anomalyRouter.get('/', (req: Request, res: Response) => {
  const severity = req.query.severity as string | undefined;
  const resolved = req.query.resolved !== undefined ? req.query.resolved === 'true' : undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

  const anomalies = db.getAnomalies({ severity, resolved, limit });
  res.json({ success: true, data: anomalies });
});

anomalyRouter.post('/:id/resolve', (req: Request, res: Response) => {
  const id = req.params.id;
  const success = db.resolveAnomaly(id);
  if (success) {
    res.json({ success: true, message: `Anomaly ${id} resolved` });
  } else {
    res.status(404).json({ success: false, error: 'Anomaly not found' });
  }
});
