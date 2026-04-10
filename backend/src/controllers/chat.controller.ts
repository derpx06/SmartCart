import type { Request, Response } from 'express';
import { handleChatMessage, streamChatMessage, getChatHistory } from '../services/chat.service';

export const sendChatMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, sessionId } = req.body ?? {};
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    const userId = req.user?.userId;
    const resolvedSessionId = sessionId || `session_${Date.now()}`;

    const response = await handleChatMessage(req, resolvedSessionId, message, userId);
    res.json(response);
  } catch (error) {
    console.error('Chat failed:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
};

export const streamChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, sessionId } = req.body ?? {};
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const userId = req.user?.userId;
    const resolvedSessionId = sessionId || `session_${Date.now()}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const { response, chunks } = await streamChatMessage(req, resolvedSessionId, message, userId);

    res.write(`event: meta\ndata: ${JSON.stringify({
      sessionId: response.sessionId,
      intent: response.intent,
      needs: response.needs,
      products: response.products,
    })}\n\n`);

    for (const chunk of chunks) {
      res.write(`event: chunk\ndata: ${chunk}\n\n`);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }

    res.write('event: done\ndata: done\n\n');
    res.end();
  } catch (error) {
    console.error('Chat stream failed:', error);
    res.status(500).json({ error: 'Chat stream failed' });
  }
};

export const chatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }
    const history = await getChatHistory(sessionId, 50);
    res.json({ sessionId, history });
  } catch (error) {
    console.error('Chat history failed:', error);
    res.status(500).json({ error: 'Chat history failed' });
  }
};
