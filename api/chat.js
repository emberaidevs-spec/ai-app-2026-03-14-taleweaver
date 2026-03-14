export default async function handler(req, res) {
  try {
    const { method } = req;
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (method === 'OPTIONS') {
      return res.writeHead(200, corsHeaders).end();
    }

    if (method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, tone, style } = req.body;

    if (!prompt || !tone || !style) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const systemPrompt = `Generate a ${style} piece of writing in the style of ${tone}. The prompt is: ${prompt}.`;
    const messages = [{ role: 'system', content: systemPrompt }];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ response: aiResponse }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}