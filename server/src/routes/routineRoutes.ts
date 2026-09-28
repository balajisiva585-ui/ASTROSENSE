import { Router } from 'express';
import { crewRoutineManager } from '../crew/CrewRoutineManager';

export const routineRoutes = Router();

// GET /api/routine/overview
routineRoutes.get('/overview', (req, res) => {
  const astronautId = (req.query.astronautId as string) || 'AST-01';
  const overview = crewRoutineManager.getScheduleOverview(astronautId);
  res.json({ success: true, data: overview });
});

// GET /api/routine/all & /api/routine/schedules
routineRoutes.get('/all', (req, res) => {
  const schedules = crewRoutineManager.getAllCrewSchedules();
  res.json({ success: true, data: schedules });
});

routineRoutes.get('/schedules', (req, res) => {
  const schedules = crewRoutineManager.getAllCrewSchedules();
  res.json({ success: true, data: schedules });
});

routineRoutes.get('/schedule/:id', (req, res) => {
  const overview = crewRoutineManager.getScheduleOverview(req.params.id);
  res.json({ success: true, data: overview });
});

// POST /api/routine/task & /api/routine/tasks
const handleAddTask = (req: any, res: any) => {
  const task = req.body;
  if (!task.title) {
    return res.status(400).json({ success: false, error: 'title is required' });
  }
  const newTask = crewRoutineManager.addTask(task);
  res.json({ success: true, data: newTask });
};
routineRoutes.post('/task', handleAddTask);
routineRoutes.post('/tasks', handleAddTask);

// POST & PATCH /api/routine/tasks/:id/status
const handleStatusUpdate = (req: any, res: any) => {
  const taskId = req.params.id;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, error: 'status is required' });
  }

  const result = crewRoutineManager.updateTaskStatus(taskId, status);
  if (!result.success) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }
  res.json({ success: true, data: result.task });
};
routineRoutes.post('/task/:id/status', handleStatusUpdate);
routineRoutes.post('/tasks/:id/status', handleStatusUpdate);
routineRoutes.patch('/tasks/:id/status', handleStatusUpdate);

// GET /api/routine/announcements
routineRoutes.get('/announcements', (req, res) => {
  const announcements = crewRoutineManager.getAnnouncements();
  res.json({ success: true, data: announcements });
});

// POST /api/routine/announcements
routineRoutes.post('/announcements', (req, res) => {
  const { text, category, astronautId } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, error: 'text is required' });
  }
  const ann = crewRoutineManager.triggerAnnouncement(text, category, astronautId);
  res.json({ success: true, data: ann });
});

// GET /api/routine/voice-settings
routineRoutes.get('/voice-settings', (req, res) => {
  const settings = crewRoutineManager.getVoiceSettings();
  res.json({ success: true, data: settings });
});

// POST /api/routine/voice-settings
routineRoutes.post('/voice-settings', (req, res) => {
  const { enabled, volume } = req.body;
  const updated = crewRoutineManager.updateVoiceSettings(Boolean(enabled), volume);
  res.json({ success: true, data: updated });
});
