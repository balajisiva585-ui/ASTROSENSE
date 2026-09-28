import { Router, Request, Response } from 'express';
import { db } from '../database/db';
import { simulationService } from '../services/simulationService';
import { CommStatus } from '../types';

export const simulationRouter = Router();

simulationRouter.get('/session', (_req: Request, res: Response) => {
  const session = db.getSession();
  res.json({ success: true, data: session });
});

simulationRouter.post('/comm-status', (req: Request, res: Response) => {
  const status = req.body.status as CommStatus;
  if (!['ONLINE', 'DEGRADED', 'OFFLINE'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid comm status' });
  }
  const result = simulationService.setCommStatus(status);
  res.json({ success: true, data: result });
});

// Original Judge Demo Endpoints
simulationRouter.get('/demo/status', (_req: Request, res: Response) => {
  const status = simulationService.getDemoStatus();
  res.json({ success: true, data: status });
});

simulationRouter.post('/demo/start', (req: Request, res: Response) => {
  const speed = req.body.speed ? parseFloat(req.body.speed) : 1;
  simulationService.startJudgeDemo(speed);
  res.json({ success: true, message: 'Judge demo started', speed });
});

simulationRouter.post('/demo/stop', (_req: Request, res: Response) => {
  simulationService.stopJudgeDemo();
  res.json({ success: true, message: 'Judge demo stopped' });
});

simulationRouter.post('/demo/step', (req: Request, res: Response) => {
  const stepIndex = parseInt(req.body.stepIndex, 10);
  if (isNaN(stepIndex)) {
    return res.status(400).json({ success: false, error: 'stepIndex must be a number' });
  }
  simulationService.stepJudgeDemo(stepIndex);
  res.json({ success: true, message: `Stepped to demo step ${stepIndex}` });
});

// New Extended 14-Step Space Demo Endpoints
simulationRouter.get('/extended-demo/status', (_req: Request, res: Response) => {
  const status = simulationService.getExtendedDemoStatus();
  res.json({ success: true, data: status });
});

simulationRouter.post('/extended-demo/start', (req: Request, res: Response) => {
  const speed = req.body.speed ? parseFloat(req.body.speed) : 1;
  simulationService.startExtendedDemo(speed);
  res.json({ success: true, message: 'Extended space demo started', speed });
});

simulationRouter.post('/extended-demo/stop', (_req: Request, res: Response) => {
  simulationService.stopExtendedDemo();
  res.json({ success: true, message: 'Extended space demo stopped' });
});

simulationRouter.post('/extended-demo/step', (req: Request, res: Response) => {
  const stepIndex = parseInt(req.body.stepIndex, 10);
  if (isNaN(stepIndex)) {
    return res.status(400).json({ success: false, error: 'stepIndex must be a number' });
  }
  simulationService.stepExtendedDemo(stepIndex);
  res.json({ success: true, message: `Stepped to extended step ${stepIndex}` });
});

// New 16-Step Advanced Monitoring Demo Endpoints
simulationRouter.get('/advanced-demo/status', (_req: Request, res: Response) => {
  const status = simulationService.getAdvancedDemoStatus();
  res.json({ success: true, data: status });
});

simulationRouter.post('/advanced-demo/start', (req: Request, res: Response) => {
  const speed = req.body.speed ? parseFloat(req.body.speed) : 1;
  simulationService.startAdvancedDemo(speed);
  res.json({ success: true, message: 'Advanced monitoring demo started', speed });
});

simulationRouter.post('/advanced-demo/stop', (_req: Request, res: Response) => {
  simulationService.stopAdvancedDemo();
  res.json({ success: true, message: 'Advanced monitoring demo stopped' });
});

simulationRouter.post('/advanced-demo/step', (req: Request, res: Response) => {
  const stepIndex = parseInt(req.body.stepIndex, 10);
  if (isNaN(stepIndex)) {
    return res.status(400).json({ success: false, error: 'stepIndex must be a number' });
  }
  simulationService.stepAdvancedDemo(stepIndex);
  res.json({ success: true, message: `Stepped to advanced step ${stepIndex}` });
});

// Live Event Stream
simulationRouter.get('/live-stream', (_req: Request, res: Response) => {
  const stream = simulationService.getLiveEventStream();
  res.json({ success: true, data: stream });
});

// Manual Simulation Triggers
simulationRouter.post('/trigger-fall', async (_req: Request, res: Response) => {
  const event = await simulationService.recordActivity('FALL_ABNORMAL_MOVEMENT', 'EXERCISE_AREA', 98.6);
  res.json({ success: true, message: 'Simulated fall triggered', data: event });
});

simulationRouter.post('/trigger-inactivity', async (_req: Request, res: Response) => {
  const event = await simulationService.recordActivity('LONG_INACTIVITY', 'WORKSTATION', 96.2);
  res.json({ success: true, message: 'Simulated long inactivity triggered', data: event });
});
