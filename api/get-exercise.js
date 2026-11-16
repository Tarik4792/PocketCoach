import { requireUser } from './_rateLimit.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Require a valid Supabase session and enforce a per-user rate limit
  const user = await requireUser(req, res, 'get-exercise', 60, 60);
  if (!user) return;

  const name = typeof req.body?.name === 'string' ? req.body.name.slice(0, 80) : '';
  if (!name.trim()) return res.status(200).json({ found: false });

  const simplify = (n) => {
    return n
      .toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/\b(left|right|alternating|single|double|reverse|modified|weighted|slow|fast|explosive|lateral|wide|narrow|close|grip|stance|leg|arm|hold|pulse|raise|press|curl|extension|fly|row|pull|push|dip|jump|hop|skip|sprint|run|walk|step|side|front|back|up|down|in|out|and|with|without|the|a|an)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .slice(0, 2)
      .join(' ')
      .trim();
  };

  const searchName = simplify(name);
  if (!searchName) return res.status(200).json({ found: false });

  try {
    const response = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(searchName)}?limit=1&offset=0`,
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
        },
      }
    );

    const data = await response.json();
    const exercise = Array.isArray(data) ? data[0] : null;

    if (!exercise) return res.status(200).json({ found: false });

    res.status(200).json({
      found: true,
      instructions: exercise.instructions || [],
      targetMuscle: exercise.target || null,
      secondaryMuscles: exercise.secondaryMuscles || [],
      bodyPart: exercise.bodyPart || null,
      difficulty: exercise.difficulty || null,
    });
  } catch (error) {
    console.error('get-exercise error:', error.message);
    res.status(200).json({ found: false });
  }
}