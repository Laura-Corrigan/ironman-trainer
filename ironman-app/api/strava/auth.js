export default function handler(req, res) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = `https://${req.headers.host}/api/strava/callback`;
  const scope = 'activity:read_all';

  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&approval_prompt=auto`;

  res.redirect(302, authUrl);
}
