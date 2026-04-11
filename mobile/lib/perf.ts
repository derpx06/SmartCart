type PerfMetadata = Record<string, unknown>;

let perfSequence = 0;

function getNow() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }

  return Date.now();
}

function roundMs(value: number) {
  return Math.round(value * 100) / 100;
}

function safeSerialize(metadata?: PerfMetadata) {
  if (!metadata) return '';

  const entries = Object.entries(metadata).filter(([, value]) => value !== undefined);
  if (!entries.length) return '';

  return ` ${JSON.stringify(Object.fromEntries(entries))}`;
}

export function createPerfTrace(label: string, metadata?: PerfMetadata) {
  const id = ++perfSequence;
  const startAt = getNow();

  console.info(`[PERF][${label}#${id}] start${safeSerialize(metadata)}`);

  return {
    id,
    label,
    startAt,
    mark(phase: string, extra?: PerfMetadata) {
      const elapsedMs = roundMs(getNow() - startAt);
      console.info(`[PERF][${label}#${id}] ${phase} +${elapsedMs}ms${safeSerialize(extra)}`);
      return getNow();
    },
    end(phase = 'done', extra?: PerfMetadata) {
      const elapsedMs = roundMs(getNow() - startAt);
      console.info(`[PERF][${label}#${id}] ${phase} +${elapsedMs}ms${safeSerialize(extra)}`);
      return elapsedMs;
    },
  };
}

export function measureUiCommit(label: string, responseReceivedAt: number, metadata?: PerfMetadata) {
  const commitAt = getNow();
  console.info(
    `[PERF][${label}] state-committed +${roundMs(commitAt - responseReceivedAt)}ms${safeSerialize(metadata)}`,
  );

  const onFrame = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (cb: () => void) => setTimeout(cb, 16);

  onFrame(() => {
    const frameAt = getNow();
    console.info(
      `[PERF][${label}] next-frame +${roundMs(frameAt - responseReceivedAt)}ms${safeSerialize(metadata)}`,
    );
  });
}

export function getPerfNow() {
  return getNow();
}
