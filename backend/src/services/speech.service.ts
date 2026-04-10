import OpenAI from 'openai';
import { toFile } from 'openai/uploads';
import { env } from '../config/env';

function getClient() {
  if (!env.groqApiKey) {
    throw new Error('GROQ_API_KEY is not set');
  }
  return new OpenAI({
    apiKey: env.groqApiKey,
    baseURL: env.groqBaseUrl || 'https://api.groq.com/openai/v1',
  });
}

export async function transcribeSpeech(args: {
  audioBuffer: Buffer;
  mimeType?: string;
  fileName?: string;
  language?: string;
  prompt?: string;
}): Promise<string> {
  const client = getClient();
  const model = env.groqSttModel || 'whisper-large-v3-turbo';

  const file = await toFile(
    args.audioBuffer,
    args.fileName || 'speech-input.webm',
    {
      type: args.mimeType || 'audio/webm',
    }
  );

  const response = await client.audio.transcriptions.create({
    model,
    file,
    ...(args.language ? { language: args.language } : {}),
    ...(args.prompt ? { prompt: args.prompt } : {}),
    temperature: 0,
  });

  return (response.text || '').trim();
}

export async function synthesizeSpeech(args: {
  text: string;
  voice?: string;
  format?: 'mp3' | 'wav';
}): Promise<{ audio: Buffer; contentType: string }> {
  const client = getClient();
  const model = env.groqTtsModel || 'canopylabs/orpheus-v1-english';
  const input = String(args.text || '').trim();
  if (!input) throw new Error('Text is required');

  // Groq is OpenAI-compatible; response is binary audio.
  const response = await client.audio.speech.create({
    model,
    input,
    voice: args.voice || 'alloy',
  } as any);

  const bytes = await response.arrayBuffer();
  const audio = Buffer.from(bytes);
  const contentType = args.format === 'wav' ? 'audio/wav' : 'audio/mpeg';
  return { audio, contentType };
}

