const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const GOALS = ['Lose Weight', 'Build Strength', 'Stay Active'];

const EQUIPMENT_RULES = {
  'None': 'Bodyweight only. No equipment and no furniture (no chairs, benches or bars).',
  'Dumbbells': 'Dumbbells only. Most exercises must use dumbbells and be named with a "Dumbbell" prefix, such as "Dumbbell Goblet Squat", "Dumbbell Row", "Dumbbell Shoulder Press", "Dumbbell Romanian Deadlift", "Dumbbell Lunge", "Dumbbell Curl". One or two bodyweight moves are fine for core.',
  'Resistance Bands': 'Resistance bands only. Most exercises must use a band and be named with a "Band" prefix, such as "Band Row", "Band Squat", "Band Pull Apart", "Band Shoulder Press".',
  'Full Gym': 'Full gym available. Use barbells, dumbbells, cables and machines, with standard names such as "Barbell Squat", "Cable Row", "Lat Pulldown", "Leg Press".',
};

const THEMES = [
  'cardio-focused', 'strength-focused', 'core-focused', 'full-body circuit',
  'upper-body focused', 'lower-body focused', 'HIIT-style', 'mobility and strength',
  'endurance-based', 'power and explosiveness',
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Require a valid Supabase session (anonymous users count)
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const auth = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    });
    if (!auth.ok) return res.status(401).json({ error: 'Unauthorized' });
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const body = req.body || {};

  // Validate and whitelist inputs
  const minutes = Math.min(Math.max(parseInt(body.minutes, 10) || 10, 1), 60);
  const fitnessLevel = LEVELS.includes(body.fitnessLevel) ? body.fitnessLevel : 'Intermediate';
  const equipment = EQUIPMENT_RULES[body.equipment] ? body.equipment : 'None';
  const goal = GOALS.includes(body.goal) ? body.goal : 'Stay Active';
  const previousWorkout = typeof body.previousWorkout === 'string'
    ? body.previousWorkout.replace(/[\r\n]+/g, ' ').slice(0, 300)
    : '';

  const varietyInstruction = previousWorkout
    ? `Do NOT use any of these exercises from the previous workout: ${previousWorkout}. Use different exercises.`
    : '';

  const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];

  const prompt = `Create a ${minutes}-minute ${randomTheme} workout for a busy professional.
Fitness level: ${fitnessLevel}
Goal: ${goal}
Equipment rule: ${EQUIPMENT_RULES[equipment]}
${varietyInstruction}

Rules:
- Match difficulty to the fitness level. Beginner means low-impact basics. Advanced means challenging variations.
- Only use safe, well-known exercises. No maximal-effort lifts and nothing that needs a spotter.
- Use simple, standard, searchable exercise names. Do not invent creative or compound names.
- Follow the equipment rule strictly.

Respond with ONLY a JSON object in this exact format, no markdown:
{
  "title": "creative workout title that reflects the theme",
  "theme": "${randomTheme}",
  "exercises": [
    { "name": "Exercise Name", "duration": "45 sec", "rest": "15 sec", "reps": null },
    { "name": "Exercise Name", "duration": null, "rest": "30 sec", "reps": "10 reps" }
  ],
  "tip": "one motivational tip for busy professionals"
}`;

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
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic error', response.status, JSON.stringify(data));
      return res.status(502).json({ error: 'Workout generation failed. Please try again.' });
    }

    const text = (data.content?.[0]?.text || '').trim();
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const workout = JSON.parse(cleaned);

    if (!Array.isArray(workout.exercises) || workout.exercises.length === 0) {
      throw new Error('Invalid workout shape');
    }

    res.status(200).json(workout);
  } catch (error) {
    console.error('generate-workout error:', error.message);
    res.status(500).json({ error: 'Workout generation failed. Please try again.' });
  }
}