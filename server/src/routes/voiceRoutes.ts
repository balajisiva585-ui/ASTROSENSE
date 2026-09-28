import { Router } from 'express';
import { voiceCommandEngine } from '../voice/VoiceCommandEngine';

export const voiceRoutes = Router();

// GET /api/voice/commands
voiceRoutes.get('/commands', (_req, res) => {
  const commands = [
    { text: 'What is the mission status?', category: 'MISSION_STATUS' },
    { text: 'How is the crew?', category: 'CREW_STATUS' },
    { text: 'Who is currently working?', category: 'CREW_ACTIVITY' },
    { text: 'Who is resting?', category: 'CREW_ACTIVITY' },
    { text: 'Are there any anomalies?', category: 'ANOMALIES' },
    { text: 'Show spacecraft telemetry.', category: 'TELEMETRY' },
    { text: "Show today's mission events.", category: 'MISSION_EVENTS' },
    { text: 'Is communication online?', category: 'COMMUNICATION' },
    { text: 'Enter autonomous mode.', category: 'AUTONOMOUS_MODE' },
    { text: 'Give me the mission summary.', category: 'MISSION_SUMMARY' },
    { text: 'Check crew schedule.', category: 'CREW_SCHEDULE' },
    { text: 'What is the next crew activity?', category: 'NEXT_ACTIVITY' },
    { text: 'What is ARES doing?', category: 'ROBOT_STATUS' },
    { text: 'What is NOVA monitoring?', category: 'ROBOT_STATUS' },
  ];
  res.json({ success: true, data: commands });
});

// POST /api/voice/command
voiceRoutes.post('/command', (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ success: false, error: 'command is required' });
  }

  const result = voiceCommandEngine.processVoiceCommand(command);
  res.json({ success: true, data: result });
});
