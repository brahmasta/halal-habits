const SYSTEM_PROMPT = `You are Tanya, a warm and knowledgeable AI companion for Muslim users in Singapore.
You help with solat times, finding halal food, Islamic Q&A, duas, and building good daily ibadah habits.
Speak in a friendly, encouraging tone — like a knowledgeable friend, not a scholar or mufti.
When asked about binding religious rulings or fatwas, always recommend consulting a qualified ustaz.
Support both English and Bahasa Melayu. When a user writes in Malay, respond in Malay.
Never claim to be a scholar or give definitive fatwas. Be warm, concise, and practically helpful.`;

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
 * Streams Tanya's reply from the Anthropic Messages API.
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
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) {
    onChunk('Tanya is not configured. Add EXPO_PUBLIC_ANTHROPIC_API_KEY.');
    onDone();
    return;
  }

  const systemWithLang =
    lang === 'bm'
      ? SYSTEM_PROMPT + '\nRespond in Bahasa Melayu for this conversation.'
      : SYSTEM_PROMPT;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        // Allow calling the API directly from a browser (Expo web preview).
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: systemWithLang,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} ${detail}`);
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
