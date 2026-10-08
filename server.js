import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const root = dirname(fileURLToPath(import.meta.url));
const databasePath = process.env.RSVP_DB_PATH || resolve(root, '.data/rsvps.sqlite');
mkdirSync(dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec(`CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  attending TEXT NOT NULL, guests INTEGER NOT NULL, dietary TEXT NOT NULL,
  shuttle TEXT NOT NULL, message TEXT NOT NULL, updated_at TEXT NOT NULL
)`);
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
app.post('/api/rsvp', (req, res) => {
  const input = req.body || {};
  const str = (key) => typeof input[key] === 'string' ? input[key].trim() : '';
  const name = str('name'), email = str('email').toLowerCase(), attending = str('attending');
  const dietary = str('dietary'), message = str('message'), shuttle = str('shuttle');
  const guests = attending === 'yes' ? Number(input.guests) : 0;
  if (name.length < 2 || name.length > 120) return res.status(400).json({ error: 'Please enter your full name (2–120 characters).' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (!['yes', 'no'].includes(attending)) return res.status(400).json({ error: 'Please choose whether you can attend.' });
  if (attending === 'yes' && (!Number.isInteger(guests) || guests < 1 || guests > 2)) return res.status(400).json({ error: 'Please select one or two guests.' });
  if (attending === 'yes' && !['yes', 'no'].includes(shuttle)) return res.status(400).json({ error: 'Please choose a shuttle preference.' });
  if (dietary.length > 1000 || message.length > 2000) return res.status(400).json({ error: 'Please shorten your message or dietary notes.' });
  // A saved browser token is required to edit an existing response; knowing an email is insufficient.
  const existing = db.prepare('SELECT id FROM responses WHERE email = ?').get(email);
  if (existing && str('responseId') !== existing.id) return res.status(409).json({ error: 'A response already exists for this email. Please edit it from the browser you used to RSVP.' });
  const id = existing?.id || randomUUID();
  db.prepare(`INSERT INTO responses VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET name=excluded.name, attending=excluded.attending,
    guests=excluded.guests, dietary=excluded.dietary, shuttle=excluded.shuttle,
    message=excluded.message, updated_at=excluded.updated_at`)
    .run(id, name, email, attending, guests, attending === 'yes' ? dietary : '', attending === 'yes' ? shuttle : '', message, new Date().toISOString());
  res.json({ ok: true, id });
});
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError || err.type === 'entity.too.large') return res.status(400).json({ error: 'Please check your response and try again.' });
  next(err);
});
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(resolve(root, 'dist')));
  app.get('/{*path}', (_req, res) => res.sendFile(resolve(root, 'dist/index.html')));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}
const port = Number(process.env.PORT || 3000);
const server = app.listen(port, '0.0.0.0', () => console.log(`Invitation ready on port ${port}`));
process.on('SIGTERM', () => server.close(() => { db.close(); process.exit(0); }));
