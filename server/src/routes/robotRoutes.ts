import { Router } from 'express';
import { robotManager } from '../robots/RobotManager';
import { RobotId, HabitatModule } from '../types';

export const robotRoutes = Router();

// GET /api/robots
robotRoutes.get('/', (req, res) => {
  const robots = robotManager.getAllRobots();
  res.json({ success: true, data: robots });
});

// GET /api/robots/logs
robotRoutes.get('/logs', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;
  const logs = robotManager.getCommLogs(limit);
  res.json({ success: true, data: logs });
});

// GET /api/robots/:id
robotRoutes.get('/:id', (req, res) => {
  const robotId = req.params.id as RobotId;
  const robot = robotManager.getRobot(robotId);
  if (!robot) {
    return res.status(404).json({ success: false, error: 'Robot not found' });
  }
  res.json({ success: true, data: robot });
});

// POST /api/robots/:id/action
robotRoutes.post('/:id/action', (req, res) => {
  const robotId = req.params.id as RobotId;
  const { action, module } = req.body;
  if (!action) {
    return res.status(400).json({ success: false, error: 'action parameter is required' });
  }

  const result = robotManager.sendRobotAction(robotId, action, module as HabitatModule);
  res.json({ success: true, data: result });
});
