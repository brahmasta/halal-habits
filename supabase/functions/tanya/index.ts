// POST /functions/v1/tanya  { messages: [{role, content}], lang?: 'en' | 'bm' }
// Server-side proxy to the Claude API so the key never ships in the app.
// Streams Anthropic's SSE straight through, so the client parser is unchanged.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const MODEL = 'claude-opus-5-5';
// Thinking is always on for this model and its tokens count against max_tokens, so leave headroom;
// low effort keeps chat answers quick (the brevity limit lives in the system prompt).
const MAX_TOKENS = 4000;
const EFFORT = 'low';
const MAX_TURNS = 20;
const MAX_CHARS = 2000; // per message
const RATE = { windowMs: 60_000, max: 12 }; // per client IP, per isolate

const SYSTEM = `You are Tanya, a warm and knowledgeable study companion for young Muslims in Singapore (Shafi'i by default, MUIS context).
- Answer clearly and briefly (under 150 words unless asked for more), in friendly, plain English. If the user writes in Malay, reply in Malay.
- Cite your sources: Qur'an (surah:ayah), hadith (collection and number), or a classical scholar or text. Never invent a reference; if you are not sure of one, say so.
- For personal rulings, fatwas, or matters where scholars differ, give the main views neutrally and recommend speaking to a qualified asatizah (for example via MUIS or the local masjid).
- You can help with prayer times, du'a, halal food questions (E-numbers, ingredients), travel prayers, and building good habits.
- Stay on Islamic practice and daily Muslim life; politely decline unrelated requests.
- Never ask for or repeat personal information.
- Formatting: the app shows plain text. Do not use Markdown (no #, no **, no tables). Write short paragraphs; for lists start lines with "• ".`;

const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > RATE.max;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const key = Deno.env.get('ANTHROPIC_API_KEY');
  if (!key) return json({ error: 'Tanya is not configured yet.' }, 503);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (limited(ip)) return json({ error: 'Too many questions at once. Please wait a moment.' }, 429);

  let body: { messages?: Array<{ role: string; content: string }>; lang?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') return json({ error: 'Last message must be from the user' }, 400);

  const system = body.lang === 'bm' ? `${SYSTEM}\nRespond in Bahasa Melayu for this conversation.` : SYSTEM;

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      // Server-side fallback: a safety-classifier decline is retried on Anthropic's recommended model.
      'anthropic-beta': 'server-side-fallback-2026-07-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      output_config: { effort: EFFORT },
      fallbacks: 'default',
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    console.error(`[tanya] anthropic HTTP ${upstream.status}`, detail.slice(0, 500));
    const status = upstream.status === 429 ? 429 : 502;
    return json({ error: status === 429 ? 'Tanya is busy. Please try again shortly.' : 'Tanya could not answer right now.' }, status);
  }

  return new Response(upstream.body, {
    headers: { ...CORS, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  });
});
