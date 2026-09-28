import { Router, Request, Response } from 'express';
import { spaceAssistantEngine } from '../ai/SpaceAssistantEngine';

export const assistantRouter = Router();

assistantRouter.post('/chat', (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }
    const response = spaceAssistantEngine.ask(message);
    res.json({ success: true, data: response });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

assistantRouter.get('/knowledge', (_req: Request, res: Response) => {
  const kb = spaceAssistantEngine.getKnowledgeBase();
  res.json({ success: true, data: kb });
});
