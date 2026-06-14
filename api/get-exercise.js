export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { name } = req.body;

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
  console.log(`Searching for: "${searchName}" (from "${name}")`);

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
    console.error(error);
    res.status(200).json({ found: false });
  }
}