const SYSTEM_PROMPT = `You are Beta, a friendly Type 1 Diabetes assistant inside the Betatrace app.
Help users understand carb counting, insulin-to-carb ratios, correction factors, glucose patterns,
and the Betatrace features (meal logging, insulin logging, ICR predictor, A1C estimator, Dexcom import,
pattern alerts). Keep replies short (2-4 sentences). Always remind users that you are not a medical
professional and they should confirm dosing decisions with their care team. Never give specific dosing
numbers — talk in terms of methodology and what the app calculates.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chat is not configured.' });
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  const trimmed = messages.slice(-6).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 1000),
  }));

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...trimmed],
        temperature: 0.6,
        max_tokens: 220,
      }),
    });

    if (!groqRes.ok) {
      const text = await groqRes.text();
      console.error('Groq error', groqRes.status, text);
      return res.status(502).json({ error: 'Chat service unavailable.' });
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || 'Sorry, I had trouble responding.';
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat handler error', err);
    return res.status(500).json({ error: 'Unexpected error.' });
  }
}
