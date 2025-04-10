export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).end('Method Not Allowed');
    }
  
    const {
      GITHUB_TOKEN,
      GITHUB_USERNAME,
      GITHUB_REPO,
    } = process.env;
  
    const BRANCH = 'main';
    const FILE_PATH = 'data/registry.json';
  
    const newEntry = req.body;
  
    // Step 1: Get current file content + SHA
    const repoUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
    };
  
    const fileRes = await fetch(`${repoUrl}?ref=${BRANCH}`, { headers });
    const fileData = await fileRes.json();
  
    if (!fileRes.ok) {
      return res.status(500).json({ error: 'Failed to fetch file from GitHub', details: fileData });
    }
  
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
    const registry = JSON.parse(content);
  
    // Step 2: Append new entry
    const nextId = registry.length > 0 ? Math.max(...registry.map(e => e.id)) + 1 : 1;
    newEntry.id = nextId;
    registry.push(newEntry);
  
    // Step 3: Commit the updated file
    const newContent = Buffer.from(JSON.stringify(registry, null, 2)).toString('base64');
    const commitRes = await fetch(repoUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `Add entry ID ${newEntry.id}`,
        content: newContent,
        sha: fileData.sha,
        branch: BRANCH,
      }),
    });
  
    if (!commitRes.ok) {
      const error = await commitRes.json();
      return res.status(500).json({ error: 'Failed to commit file', details: error });
    }
  
    const commitData = await commitRes.json(); 
    newEntry.sha = commitData.commit.sha;
    return res.status(200).json({ success: true, id: newEntry.id, sha: newEntry.sha });
  }
  