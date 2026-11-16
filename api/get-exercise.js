import { requireUser } from './_rateLimit.js';

const STOP = new Set(['and', 'with', 'the', 'a', 'an', 'left', 'right', 'alternating']);

// Lowercase, split into word tokens, drop filler words, and make plurals singular.
const tokens = (s) =>
  String(s)
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .split(/[^a-z]+/)
    .filter((w) => w && !STOP.has(w))
    .map((w) => (w.length > 2 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w));

// 0 to 1: how closely two exercise names match.
const similarity = (a, b) => {
  const A = new Set(tokens(a));
  const B = new Set(tokens(b));
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const w of A) if (B.has(w)) shared++;
  return shared / (A.size + B.size - shared);
};

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

  // Search terms to try, most specific first (at most 3 lookups per exercise)
  const words = tokens(name);
  const candidates = [];
  const add = (c) => { if (c && !candidates.includes(c)) candidates.push(c); };
  add(words.join(' '));                                    // e.g. "dumbbell goblet squat"
  if (words.length === 2) add(words.join('-'));            // e.g. "push-up"
  if (words.length > 2) add(words.slice(-2).join(' '));    // e.g. "goblet squat"
  else if (words.length === 2) add(words[1]);              // e.g. "squat"
  const queries = candidates.slice(0, 3);

  try {
    let best = null;
    let bestScore = 0;

    for (const q of queries) {
      const response = await fetch(
        `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(q)}?limit=10&offset=0`,
        {
          headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
          },
        }
      );
      const data = await response.json();
      if (!Array.isArray(data)) continue;

      for (const ex of data) {
        const score = similarity(name, ex.name);
        if (score > bestScore) { best = ex; bestScore = score; }
      }
      if (bestScore === 1) break; // exact match, stop early
    }

    // Only trust a close match. Showing no details is better than the wrong exercise.
    if (!best || bestScore < 0.5) return res.status(200).json({ found: false });

    res.status(200).json({
      found: true,
      instructions: best.instructions || [],
      targetMuscle: best.target || null,
      secondaryMuscles: best.secondaryMuscles || [],
      bodyPart: best.bodyPart || null,
      difficulty: best.difficulty || null,
    });
  } catch (error) {
    console.error('get-exercise error:', error.message);
    res.status(200).json({ found: false });
  }
}
