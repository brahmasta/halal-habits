export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Extract `text_delta` text from a single SSE `data:` payload.
function emitFromSSELine(line: string, onChunk: (text: string) => void) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return;
  const payload = trimmed.slice(5).trim();
  if (!payload || payload === '[DONE]') return;
  try {
    const evt = JSON.parse(payload);
    if (
      evt.type === 'content_block_delta' &&
      evt.delta?.type === 'text_delta' &&
      typeof evt.delta.text === 'string'
    ) {
      onChunk(evt.delta.text);
    }
  } catch {
    // ignore keep-alive / non-JSON lines
  }
}

/**
 * Streams Tanya's reply via the `tanya` Supabase edge function (a Claude API proxy).
 *
 * - On web the response body is a ReadableStream, so we surface text deltas
 *   incrementally as they arrive (true streaming UX).
 * - On React Native fetch buffers the whole body; we then parse the complete
 *   SSE text and emit the deltas in order. Same result, just not real-time.
 */
export async function sendTanyaMessage(
  messages: Message[],
  onChunk: (text: string) => void,
  onDone: () => void,
  lang: 'en' | 'bm' = 'en'
): Promise<void> {
  // The Claude API key lives server-side in the `tanya` edge function (supabase/functions/tanya).
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://bekvxwarareoxulpswsm.supabase.co';
  try {
    const response = await fetch(`${base}/functions/v1/tanya`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, lang }),
    });

    if (!response.ok) {
      let msg = 'Sorry, I had trouble connecting. Please try again.';
      try {
        const j = (await response.json()) as { error?: string };
        if (j.error) msg = j.error;
      } catch {
        // keep default
      }
      onChunk(msg);
      onDone();
      return;
    }

    const reader = response.body?.getReader?.();

    if (reader) {
      // Web: incremental streaming.
      const decoder = new TextDecoder();
      let buffer = '';
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) emitFromSSELine(line, onChunk);
      }
      if (buffer) emitFromSSELine(buffer, onChunk);
    } else {
      // Native: body isn't readable as a stream — parse the buffered SSE text.
      const text = await response.text();
      for (const line of text.split('\n')) emitFromSSELine(line, onChunk);
    }

    onDone();
  } catch {
    onChunk('Sorry, I had trouble connecting. Please try again.');
    onDone();
  }
}
