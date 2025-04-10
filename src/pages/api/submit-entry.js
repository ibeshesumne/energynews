import { readRegistry, writeRegistry } from '../../lib/jsondb';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const newEntry = req.body;
    let data = readRegistry();

    if (newEntry.id) {
      // Update existing
      data = data.map(entry => (entry.id === newEntry.id ? newEntry : entry));
    } else {
      // Add new
      const nextId = data.length > 0 ? Math.max(...data.map(e => e.id)) + 1 : 1;
      newEntry.id = nextId;
      data.push(newEntry);
    }

    writeRegistry(data);
    res.status(200).json({ success: true });
  } else {
    res.status(405).end();
  }
}