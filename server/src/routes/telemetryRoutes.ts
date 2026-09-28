import { Router, Request, Response } from 'express';
import { telemetrySimulator } from '../telemetry/TelemetrySimulator';

export const telemetryRouter = Router();

telemetryRouter.get('/current', (_req: Request, res: Response) => {
  const telemetry = telemetrySimulator.getCurrentTelemetry();
  res.json({ success: true, data: telemetry });
});

telemetryRouter.get('/history', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  const history = telemetrySimulator.getTelemetryHistory(limit);
  res.json({ success: true, data: history });
});
