import { requireUser } from './_rateLimit.js';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const GOALS = ['Lose Weight', 'Build Strength', 'Stay Active'];

const FOCUS_RULES = {
  'Full Body': '',
  'Lower Back': 'Strengthen the lower back and the muscles that support it (glutes, core, hamstrings). Use gentle, low-impact, controlled moves such as Bird Dog, Glute Bridge, Dead Bug, Superman, Side Plank and Cat-Cow. Use a slow tempo. Use bodyweight floor moves even when equipment is available, and do not load the spine. No good mornings, no deadlifts or Romanian deadlifts of any kind, no loaded forward bends, no weighted hip hinges, no sit-ups, no straight leg raises, no jumping, no twisting under load.',
  'Upper Back': 'Target the upper and mid back, rear shoulders and posture muscles with moves such as rows, reverse flys, pull aparts, Superman and scapular squeezes.',
  'Core': 'Target the abs, obliques and deep core with moves such as planks, dead bugs, leg raises, bicycle crunches and bird dogs. Keep the lower back protected.',
  'Legs': 'Target quads, hamstrings, glutes and calves with moves such as squats, lunges, step-ups, calf raises and hip hinges.',
  'Glutes': 'Target the glutes with moves such as glute bridges, hip thrusts, donkey kicks, lunges and step-ups.',
  'Shoulders': 'Target the shoulders (front, side and rear delts) with moves such as presses, lateral raises, front raises and rear delt flys.',
  'Chest': 'Target the chest (and triceps and front shoulders as helpers) with moves such as push-ups, presses and flys.',
  'Arms': 'Target biceps, triceps and forearms with moves such as curls, extensions, dips and close-grip push-ups.',
};

const EQUIPMENT_RULES = {
  'None': 'Bodyweight only. No equipment and no furniture (no chairs, benches or bars).',
  'Dumbbells': 'Dumbbells only. Most exercises must use dumbbells and be named with a "Dumbbell" prefix, such as "Dumbbell Goblet Squat", "Dumbbell Row", "Dumbbell Shoulder Press", "Dumbbell Romanian Deadlift", "Dumbbell Lunge", "Dumbbell Curl". One or two bodyweight moves are fine for core.',
  'Resistance Bands': 'Resistance bands only. Most exercises must use a band and be named with a "Band" prefix. Use only real band exercises people actually do, such as Band Row, Band Pull Apart, Band Face Pull, Band Lat Pulldown, Band Chest Press, Band Shoulder Press, Band Bicep Curl, Band Tricep Extension, Band Squat, Band Lunge, Band Glute Bridge, Band Lateral Walk, Band Monster Walk, Band Clamshell and Band Kickback. Never invent a band version of a gym machine exercise (no Band Leg Press, Band Leg Extension, Band Leg Curl or Band Hack Squat). A few bodyweight moves with standard names, like Plank or Dead Bug, are fine.',
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

  // Require a valid Supabase session and enforce a per-user rate limit
  const user = await requireUser(req, res, 'generate-workout', 10, 60);
  if (!user) return;

  const body = req.body || {};

  // Validate and whitelist inputs
  const minutes = Math.min(Math.max(parseInt(body.minutes, 10) || 10, 1), 60);
  const fitnessLevel = LEVELS.includes(body.fitnessLevel) ? body.fitnessLevel : 'Intermediate';
  const equipment = EQUIPMENT_RULES[body.equipment] ? body.equipment : 'None';
  const goal = GOALS.includes(body.goal) ? body.goal : 'Stay Active';
  const focus = Object.keys(FOCUS_RULES).includes(body.focus) ? body.focus : 'Full Body';
  const focusLine = FOCUS_RULES[focus]
    ? `Focus area: ${focus}. ${FOCUS_RULES[focus]} At least 70 percent of the exercises must target this area. The equipment rule still applies, but bodyweight floor moves are allowed when the equipment cannot target this area safely.`
    : '';
  const setsChoice = [1, 2, 3, 4].includes(parseInt(body.sets, 10)) ? parseInt(body.sets, 10) : null;
  const setsRule = setsChoice
    ? `Every exercise must have exactly ${setsChoice} set${setsChoice > 1 ? 's' : ''}. Pick the number of exercises so the total time still fits.`
    : `Choose the number of sets per exercise to fit the session length: 1 set for 5 minutes or less, 2 sets for 6 to 15 minutes, 3 sets for longer sessions (Beginners: at most 2 sets). Then pick the number of exercises so the total time fits.`;
  const previousWorkout = typeof body.previousWorkout === 'string'
    ? body.previousWorkout.replace(/[\r\n]+/g, ' ').slice(0, 300)
    : '';

  const varietyInstruction = previousWorkout
    ? `Do NOT use any of these exercises from the previous workout: ${previousWorkout}. Use different exercises.`
    : '';

  const randomTheme = focus === 'Full Body' ? THEMES[Math.floor(Math.random() * THEMES.length)] : focus.toLowerCase() + ' focused';

  const prompt = `Create a ${minutes}-minute ${randomTheme} workout for a busy professional.
Fitness level: ${fitnessLevel}
Goal: ${goal}
Equipment rule: ${EQUIPMENT_RULES[equipment]}
${focusLine}
${setsRule}
${varietyInstruction}

Rules:
- Match difficulty to the fitness level. Beginner means low-impact basics. Advanced means challenging variations.
- Only use safe, well-known exercises. No maximal-effort lifts and nothing that needs a spotter.
- Use simple, standard, searchable exercise names. Do not invent creative or compound names.
- Follow the equipment rule strictly.
- Never include good mornings.
- If the focus area is Lower Back, keep every move gentle and controlled, and make the tip a reminder to stop if the user feels pain.
- Every exercise has a "sets" number, and the rest period applies after every set. Total time = the sum over all exercises of sets x (work time + rest). It must add up to about ${minutes} minutes. Count about 45 seconds of work per rep-based set.

Respond with ONLY a JSON object in this exact format, no markdown:
{
  "title": "creative workout title that reflects the theme",
  "theme": "${randomTheme}",
  "exercises": [
    { "name": "Exercise Name", "sets": 3, "duration": "30 sec", "rest": "15 sec", "reps": null },
    { "name": "Exercise Name", "sets": 3, "duration": null, "rest": "30 sec", "reps": "10 reps" }
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

    // Safety net: never let risky moves through for Lower Back, even if the AI ignores the rules
    if (focus === 'Lower Back') {
      const lowerBackBanned = /good ?morning|deadlift|romanian|\brdl\b|stiff.?leg|sit.?up|straight leg raise|jump|russian twist/i;
      const safeList = workout.exercises.filter((e) => !lowerBackBanned.test(String(e.name)));
      if (safeList.length >= 2) workout.exercises = safeList;
    }

    
// Make sure every exercise has a sensible number of sets
    for (const ex of workout.exercises) {
      const n = parseInt(ex.sets, 10);
      ex.sets = setsChoice || Math.min(Math.max(n || 1, 1), 5);
    }

    res.status(200).json(workout);
  } catch (error) {
    console.error('generate-workout error:', error.message);
    res.status(500).json({ error: 'Workout generation failed. Please try again.' });
  }
}