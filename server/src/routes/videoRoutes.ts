import { Router, Request, Response } from 'express';
import { videoSimulationService } from '../video/VideoSimulationService';

export const videoRoutes = Router();

videoRoutes.get('/feeds', (_req: Request, res: Response) => {
  const feeds = videoSimulationService.getAllFeeds();
  res.json({ success: true, data: feeds });
});

videoRoutes.get('/feeds/:id', (req: Request, res: Response) => {
  const feed = videoSimulationService.getFeed(req.params.id);
  if (!feed) {
    return res.status(404).json({ success: false, error: 'Camera feed not found' });
  }
  res.json({ success: true, data: feed });
});

videoRoutes.post('/feeds/:id/source', (req: Request, res: Response) => {
  const { source } = req.body;
  if (!['SIMULATED', 'WEBCAM', 'LOCAL_VIDEO'].includes(source)) {
    return res.status(400).json({ success: false, error: 'Invalid source type' });
  }
  const feed = videoSimulationService.updateFeedSource(req.params.id, source);
  if (!feed) {
    return res.status(404).json({ success: false, error: 'Camera feed not found' });
  }
  res.json({ success: true, data: feed });
});
