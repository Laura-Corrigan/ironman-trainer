import { createClient } from '@supabase/supabase-js';

async function refreshToken(supabase, tokenRow) {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: tokenRow.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) throw new Error('Token refresh failed');

  const data = await response.json();

  await supabase.from('strava_tokens').update({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  }).eq('id', 'default');

  return data.access_token;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: tokenRow, error: tokenError } = await supabase
      .from('strava_tokens')
      .select('*')
      .eq('id', 'default')
      .single();

    if (tokenError || !tokenRow) {
      return res.status(401).json({ error: 'Not connected to Strava', connected: false });
    }

    let accessToken = tokenRow.access_token;
    const now = Math.floor(Date.now() / 1000);
    if (tokenRow.expires_at < now) {
      accessToken = await refreshToken(supabase, tokenRow);
    }

    const after = req.query.after
      ? parseInt(req.query.after)
      : Math.floor(Date.now() / 1000) - (14 * 24 * 60 * 60);

    const activitiesResponse = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!activitiesResponse.ok) {
      const errText = await activitiesResponse.text();
      console.error('Strava activities fetch failed:', errText);
      return res.status(500).json({ error: 'Failed to fetch activities' });
    }

    const activities = await activitiesResponse.json();

    const typeMap = {
      'Ride': 'bike',
      'VirtualRide': 'bike',
      'Run': 'run',
      'VirtualRun': 'run',
      'Swim': 'swim',
      'Walk': null,
      'Hike': null,
      'WeightTraining': 'strength',
      'Workout': 'strength',
    };

    const formatted = activities
      .filter(a => typeMap[a.type] !== undefined)
      .map(a => ({
        id: a.id,
        name: a.name,
        type: typeMap[a.type],
        date: a.start_date_local,
        duration: Math.round(a.moving_time / 60),
        distance: a.distance ? Math.round(a.distance / 100) / 10 : null,
        avgHR: a.average_heartrate ? Math.round(a.average_heartrate) : null,
        avgPower: a.average_watts ? Math.round(a.average_watts) : null,
        avgPace: a.type === 'Run' || a.type === 'VirtualRun'
          ? formatPace(a.moving_time, a.distance)
          : null,
        calories: a.calories || null,
        isVirtual: a.type === 'VirtualRide' || a.type === 'VirtualRun',
        source: a.type === 'VirtualRide' ? 'Swift/Turbo' : 'Strava',
      }));

    return res.status(200).json({
      connected: true,
      athlete: tokenRow.athlete_name,
      activities: formatted,
      lastSync: new Date().toISOString(),
    });

  } catch (err) {
    console.error('Strava sync error:', err);
    return res.status(500).json({ error: err.message });
  }
}

function formatPace(movingTimeSec, distanceM) {
  if (!distanceM || distanceM === 0) return null;
  const paceSecPerKm = movingTimeSec / (distanceM / 1000);
  const mins = Math.floor(paceSecPerKm / 60);
  const secs = Math.round(paceSecPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
