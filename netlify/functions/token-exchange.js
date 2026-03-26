// netlify/functions/token-exchange.js  (or pages/api/token-exchange.js for Vercel)
export default async function handler(req, res) {
  const { code } = JSON.parse(req.body ?? '{}');
  if (!code) return res.status(400).json({ error: 'missing code' });

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
    },
    body: JSON.stringify({
      client_id:     process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();
  res.status(200).json(data); // includes { access_token, token_type, scope }
}
