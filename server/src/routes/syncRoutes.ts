import { Router, Request, Response } from 'express';
import { syncEngine } from '../sync/SyncEngine';

export const syncRouter = Router();

syncRouter.get('/status', (_req: Request, res: Response) => {
  const status = syncEngine.getSyncState();
  res.json({ success: true, data: status });
});

const handleTriggerSync = async (_req: Request, res: Response) => {
  try {
    const result = await syncEngine.triggerSynchronization();
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

syncRouter.post('/', handleTriggerSync);
syncRouter.post('/trigger', handleTriggerSync);
