// Vercel Serverless Function: Cloud Database Sync
const GITHUB_REPO = process.env.GITHUB_REPO || 'RikatNalendra/personal-tracker';
const FILE_PATH = 'database/cloud_db.json';

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-master-pin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Token from Vercel Environment Variable or Authorization Header
  const authHeader = req.headers.authorization;
  const token =
    process.env.GITHUB_TOKEN ||
    (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'GITHUB_TOKEN is not set. Add GITHUB_TOKEN in Vercel Settings > Environment Variables.',
    });
  }

  try {
    // 1. GET: Fetch master database from cloud
    if (req.method === 'GET') {
      const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Personal-Tracker-Executive-Sync',
        },
      });

      if (!ghRes.ok) {
        if (ghRes.status === 404) {
          return res.status(200).json({ success: false, data: null, message: 'Database file not initialized' });
        }
        const errText = await ghRes.text();
        return res.status(ghRes.status).json({ success: false, error: errText });
      }

      const fileInfo = await ghRes.json();
      const content = Buffer.from(fileInfo.content, 'base64').toString('utf-8');
      const parsedData = JSON.parse(content);

      return res.status(200).json({
        success: true,
        data: parsedData,
        sha: fileInfo.sha,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. POST: Save master database to cloud
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const dbPayload = body.data || body;

      if (!dbPayload || typeof dbPayload !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid database payload' });
      }

      // Check current file SHA
      let currentSha: string | undefined = undefined;
      const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Personal-Tracker-Executive-Sync',
        },
      });

      if (getRes.ok) {
        const currentFileInfo = await getRes.json();
        currentSha = currentFileInfo.sha;
      }

      const jsonString = JSON.stringify(dbPayload, null, 2);
      const base64Content = Buffer.from(jsonString).toString('base64');

      const putRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Personal-Tracker-Executive-Sync',
        },
        body: JSON.stringify({
          message: `Auto-sync database: ${new Date().toISOString()} [skip ci]`,
          content: base64Content,
          sha: currentSha,
        }),
      });

      if (!putRes.ok) {
        const putErr = await putRes.text();
        return res.status(putRes.status).json({ success: false, error: putErr });
      }

      const putResult = await putRes.json();

      return res.status(200).json({
        success: true,
        sha: putResult.content?.sha,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Cloud Sync Handler Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
}
