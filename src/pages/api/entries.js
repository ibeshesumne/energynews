export default async function handler(req, res) {
  const {
    GITHUB_TOKEN,
    GITHUB_USERNAME,
    GITHUB_REPO
  } = process.env;

  const FILE_PATH = 'data/registry.json';
  const BRANCH = 'main';

  const githubUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;

  const response = await fetch(githubUrl, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    return res.status(500).json({ error: 'Failed to fetch from GitHub', details: error });
  }

  const fileData = await response.json();
  const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
  const registry = JSON.parse(content);

  return res.status(200).json(registry);
}