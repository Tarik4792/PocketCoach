// Shared helper: validates the Supabase session and enforces a per-user rate limit.
// Returns the user object, or null after sending an error response.
export async function requireUser(req, res, endpoint, limit, windowMinutes) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const base = process.env.SUPABASE_URL;
  const headers = { apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` };

  let user;
  try {
    const auth = await fetch(`${base}/auth/v1/user`, { headers });
    if (!auth.ok) {
      res.status(401).json({ error: 'Unauthorized' });
      return null;
    }
    user = await auth.json();
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  try {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
    const recent = await fetch(
      `${base}/rest/v1/api_usage?select=id&endpoint=eq.${endpoint}&created_at=gte.${encodeURIComponent(since)}&limit=${limit}`,
      { headers }
    );
    if (!recent.ok) throw new Error('usage lookup failed: ' + recent.status);
    const rows = await recent.json();
    if (Array.isArray(rows) && rows.length >= limit) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return null;
    }

    const log = await fetch(`${base}/rest/v1/api_usage`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ endpoint }),
    });
    if (!log.ok) throw new Error('usage insert failed: ' + log.status);
  } catch (e) {
    console.error('rate limit error:', e.message);
    res.status(503).json({ error: 'Service temporarily unavailable. Please try again.' });
    return null;
  }

  return user;
}
