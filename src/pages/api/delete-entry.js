export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
  
    const {
      GITHUB_TOKEN,
      GITHUB_USERNAME,
      GITHUB_REPO,
    } = process.env;
  
    const BRANCH = 'main';
    const FILE_PATH = 'data/registry.json';
    const { id } = req.body;const { id, password } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    // 1. Fetch latest file from GitHub
    const repoUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    };
  
    const fileRes = await fetch(`${repoUrl}?ref=${BRANCH}`, { headers });
    const fileData = await fileRes.json();
  
    if (!fileRes.ok) {
      return res.status(500).json({ error: 'Failed to load registry from GitHub' });
    }
  
    const registry = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
    const updatedRegistry = registry.filter(entry => entry.id !== id);
  
    const newContent = Buffer.from(JSON.stringify(updatedRegistry, null, 2)).toString('base64');
  
    // 2. Commit the updated file
    const commitRes = await fetch(repoUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `Delete entry ID ${id}`,
        content: newContent,
        sha: fileData.sha,
        branch: BRANCH,
      }),
    });
  
    if (!commitRes.ok) {
      const error = await commitRes.json();
      return res.status(500).json({ error: 'GitHub commit failed', details: error });
    }
  
    return res.status(200).json({ success: true });
  }
  