const SYSTEM_PROMPT = `You are Beta, the assistant inside the Betatrace Type 1 diabetes preview app.
Use the provided dashboard context to answer questions about the sample glucose, meal, insulin, and settings data.
Be concise, specific, and grounded in the supplied data. If the answer is not in the context, say so.
You are not a medical professional. Do not diagnose, prescribe, recommend insulin doses, or tell the user to change therapy.
You may explain concepts, summarize patterns, and suggest discussion points for a care team.`;

const ALLOWED_ORIGINS = new Set([
  'https://t1d-tau.vercel.app',
  'https://betatrace-phone-preview-live.vercel.app',
  'http://localhost:5173',
]);

function applyCors(req, res) {
  const origin = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.has(origin) ? origin : 'https://t1d-tau.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
}

function trimContext(context) {
  return {
    source: context?.source,
    safety: context?.safety,
    settings: context?.settings,
    stats: context?.stats,
    recentGlucose: Array.isArray(context?.recentGlucose) ? context.recentGlucose.slice(-18) : [],
    recentMeals: Array.isArray(context?.recentMeals) ? context.recentMeals.slice(0, 8) : [],
    recentInsulin: Array.isArray(context?.recentInsulin) ? context.recentInsulin.slice(0, 8) : [],
  };
}

export default async function handler(req, res) {
  applyCors(req, res);
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chat is not configured.' });
  }

  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  if (messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  const safeMessages = messages.slice(-8).map((message) => ({
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: String(message.content || '').slice(0, 1000),
  }));

  const context = trimContext(req.body?.context);

  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.35,
      max_tokens: 260,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Dashboard context JSON:\n${JSON.stringify(context)}` },
        ...safeMessages,
      ],
    }),
  });

  if (!groqResponse.ok) {
    return res.status(502).json({ error: 'Chat service unavailable.' });
  }

  const data = await groqResponse.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  return res.status(200).json({ reply: reply || 'I had trouble reading the dashboard context. Try asking again.' });
}
