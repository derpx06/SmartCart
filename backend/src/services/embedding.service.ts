let extractorPromise: Promise<(input: string, options?: any) => Promise<any>> | null = null;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = import('@xenova/transformers').then(async (mod: any) => {
      const pipeline = mod.pipeline;
      return pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
    });
  }
  return extractorPromise;
}

export async function embedText(text: string): Promise<number[]> {
  const cleaned = String(text || '').trim();
  if (!cleaned) return [];

  const extractor = await getExtractor();
  const output = await extractor(cleaned, { pooling: 'mean', normalize: true });
  const data = output?.data || output;

  if (ArrayBuffer.isView(data)) {
    return Array.from(data as Float32Array);
  }

  if (Array.isArray(data)) {
    return data.map((v) => Number(v) || 0);
  }

  return [];
}
