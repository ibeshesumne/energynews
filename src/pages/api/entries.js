import { readRegistry } from '../../lib/jsondb';

export default function handler(req, res) {
  const data = readRegistry();
  res.status(200).json(data);
}