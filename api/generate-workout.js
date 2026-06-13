export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { minutes, fitnessLevel, equipment, goal, previousWorkout } = req.body;

  const varietyInstruction = previousWorkout
    ? `IMPORTANT: Do NOT use any of these exercises from the previous workout: ${previousWorkout}. Create a completely different workout with new exercises.`
    : '';

  const themes = [
    'cardio-focused', 'strength-focused', 'core-focused', 'full-body circuit',
    'upper-body focused', 'lower-body focused', 'HIIT-style', 'mobility and strength',
    'endurance-based', 'power and explosiveness'
  ];
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];

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
            content: `Create a ${minutes}-minute ${randomTheme} workout for a busy professional.
Fitness level: ${fitnessLevel || 'Intermediate'}
Equipment: ${equipment || 'None'}
Goal: ${goal || 'Stay Active'}
${varietyInstruction}

Choose exercises that fit the "${randomTheme}" theme. Be creative and vary the exercises significantly.

Respond with ONLY a JSON object in this exact format, no markdown:
{
  "title": "creative workout title that reflects the theme",
  "theme": "${randomTheme}",
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

    const data = await response.json();
    const text = data.content[0].text.trim();
    const workout = JSON.parse(text);
    res.status(200).json(workout);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
