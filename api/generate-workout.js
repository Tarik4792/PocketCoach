export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { minutes, fitnessLevel, equipment, goal } = req.body;

  console.log('API Key present:', !!process.env.ANTHROPIC_API_KEY);
  console.log('Request body:', { minutes, fitnessLevel, equipment, goal });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Create a ${minutes}-minute workout for a busy professional.
Fitness level: ${fitnessLevel || 'Intermediate'}
Equipment: ${equipment || 'None'}
Goal: ${goal || 'Stay Active'}

Respond with ONLY a JSON object in this exact format, no markdown:
{
  "title": "workout title",
  "exercises": [
    { "name": "Exercise Name", "duration": "45 sec", "rest": "15 sec", "reps": null },
    { "name": "Exercise Name", "duration": null, "rest": "30 sec", "reps": "10 reps" }
  ],
  "tip": "one motivational tip for busy professionals"
}`
          }
        ],
      }),
    });

    console.log('Anthropic status:', response.status);
    const data = await response.json();
    console.log('Anthropic response:', JSON.stringify(data));

    const text = data.content[0].text.trim();
    const workout = JSON.parse(text);
    res.status(200).json(workout);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
