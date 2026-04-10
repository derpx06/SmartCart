import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { synthesizeSpeech, transcribeSpeech } from '../services/speech.service';

type TtsJob = {
  id: string;
  status: 'PENDING' | 'DONE' | 'FAILED';
  createdAt: number;
  text: string;
  voice: string;
  format: 'mp3' | 'wav';
  audioBase64?: string;
  contentType?: string;
  error?: string;
};

const ttsJobs = new Map<string, TtsJob>();

export const transcribeAudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file?.buffer?.length) {
      res.status(400).json({ error: 'Audio file is required (field: audio)' });
      return;
    }

    const language = typeof req.body?.language === 'string' ? req.body.language.trim() : '';
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';

    const text = await transcribeSpeech({
      audioBuffer: file.buffer,
      mimeType: file.mimetype,
      fileName: file.originalname,
      language: language || undefined,
      prompt: prompt || undefined,
    });

    res.json({ text });
  } catch (error) {
    console.error('Speech transcription failed:', error);
    res.status(500).json({ error: 'Speech transcription failed' });
  }
};

export const synthesizeAudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    const voice = typeof req.body?.voice === 'string' ? req.body.voice.trim() : 'alloy';
    const format = req.body?.format === 'wav' ? 'wav' : 'mp3';

    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const { audio, contentType } = await synthesizeSpeech({ text, voice, format });
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store');
    res.send(audio);
  } catch (error) {
    console.error('Speech synthesis failed:', error);
    const anyErr = error as any;
    const code = anyErr?.code || anyErr?.error?.code;
    const message = anyErr?.error?.message || anyErr?.message || 'Speech synthesis failed';
    const statusCode = typeof anyErr?.status === 'number' ? anyErr.status : 500;
    res.status(statusCode).json({ error: message, ...(code ? { code } : {}) });
  }
};

export const synthesizeAudioBackground = async (req: Request, res: Response): Promise<void> => {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  const voice = typeof req.body?.voice === 'string' ? req.body.voice.trim() : 'alloy';
  const format = req.body?.format === 'wav' ? 'wav' : 'mp3';
  if (!text) {
    res.status(400).json({ error: 'Text is required' });
    return;
  }

  const id = randomUUID();
  const job: TtsJob = {
    id,
    status: 'PENDING',
    createdAt: Date.now(),
    text,
    voice,
    format,
  };
  ttsJobs.set(id, job);

  void (async () => {
    try {
      const { audio, contentType } = await synthesizeSpeech({ text, voice, format });
      job.status = 'DONE';
      job.audioBase64 = audio.toString('base64');
      job.contentType = contentType;
    } catch (error: any) {
      job.status = 'FAILED';
      job.error = error?.message || 'Speech synthesis failed';
    }
  })();

  res.status(202).json({ jobId: id, status: 'PENDING' });
};

export const getSynthesizeAudioBackground = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.jobId || '');
  const job = ttsJobs.get(id);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  if (Date.now() - job.createdAt > 15 * 60 * 1000) {
    ttsJobs.delete(id);
    res.status(410).json({ error: 'Job expired' });
    return;
  }

  if (job.status === 'DONE') {
    res.json({
      jobId: id,
      status: 'DONE',
      contentType: job.contentType,
      audioBase64: job.audioBase64,
    });
    return;
  }

  if (job.status === 'FAILED') {
    res.status(500).json({ jobId: id, status: 'FAILED', error: job.error });
    return;
  }

  res.json({ jobId: id, status: 'PENDING' });
};

