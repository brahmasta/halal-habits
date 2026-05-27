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
        'anthropic-beta': 'messages-2023-12-15',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: systemWithLang,
        messages,
        stream: false,
      }),
    });
    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
    onChunk(text);
    onDone();
  } catch {
    onChunk('Sorry, I had trouble connecting. Please try again.');
    onDone();
  }
}
