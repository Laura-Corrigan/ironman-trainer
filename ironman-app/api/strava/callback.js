import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(302, '/?strava=denied');
  }

  if (!code) {
    return res.redirect(302, '/?strava=error');
  }

  try {
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Strava token exchange failed:', await tokenResponse.text());
      return res.redirect(302, '/?strava=error');
    }

    const tokenData = await tokenResponse.json();

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    await supabase.from('strava_tokens').upsert({
      id: 'default',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
      athlete_id: tokenData.athlete?.id,
      athlete_name: \`\${tokenData.athlete?.firstname} \${tokenData.athlete?.lastname}\`,
    }, { onConflict: 'id' });

    return res.redirect(302, '/?strava=connected');
  } catch (err) {
    console.error('Strava callback error:', err);
    return res.redirect(302, '/?strava=error');
  }
}
