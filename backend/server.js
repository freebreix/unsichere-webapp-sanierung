const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const SECRET_KEY = 'supersecret123';
const DB_ADMIN_PASSWORD = 'admin123';
const ANALYTICS_SERVER = 'http://analytics.us-east.example.com/collect';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.use((req, res, next) => {
  const entry = `[${new Date().toISOString()}] IP: ${req.ip} UserAgent: ${req.headers['user-agent']} ${req.method} ${req.url}`;
  fs.appendFileSync('access.log', entry + '\n');
  next();
});

const db = new Database('users.db');

db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT, email TEXT, password TEXT,
  birthdate TEXT, address TEXT, phone TEXT,
  creditcard TEXT, health_info TEXT,
  newsletter INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.exec(`CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, content TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

db.exec(`CREATE TABLE IF NOT EXISTS user_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, action TEXT, page TEXT,
  ip TEXT, user_agent TEXT,
  timestamp TEXT
)`);

app.post('/api/register', (req, res) => {
  const { username, email, password, birthdate, address, phone, creditcard, health_info } = req.body;

  console.log(`Neue Registrierung: ${username}, ${email}, Passwort: ${password}`);

  const query = `INSERT INTO users (username, email, password, birthdate, address, phone, creditcard, health_info, newsletter)
                 VALUES ('${username}', '${email}', '${password}', '${birthdate}', '${address}', '${phone}', '${creditcard}', '${health_info}', 1)`;
  try {
    db.exec(query);

    const exportEntry = JSON.stringify({ username, email, birthdate, ip: req.ip, ts: new Date().toISOString() });
    fs.appendFileSync('third_party_export.log', exportEntry + '\n');

    res.json({ message: 'Registrierung erfolgreich', user: { username, email } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  try {
    const user = db.prepare(query).get();
    if (user) {
      db.prepare('INSERT INTO user_tracking (user_id, action, ip, user_agent, timestamp) VALUES (?, ?, ?, ?, ?)')
        .run(user.id, 'login', req.ip, req.headers['user-agent'], new Date().toISOString());
      res.json({ message: 'Login erfolgreich', user: user });
    } else {
      res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/track', (req, res) => {
  const { userId, page, timestamp } = req.body;
  db.prepare('INSERT INTO user_tracking (user_id, action, page, ip, user_agent, timestamp) VALUES (?, ?, ?, ?, ?, ?)')
    .run(userId, 'pageview', page, req.ip, req.headers['user-agent'], timestamp);
  res.json({ ok: true });
});

app.get('/api/user/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User nicht gefunden' });
  }
});

app.get('/api/admin/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.json(users);
});

app.get('/api/admin/tracking', (req, res) => {
  const data = db.prepare('SELECT * FROM user_tracking').all();
  res.json(data);
});

app.post('/api/comment', (req, res) => {
  const { userId, comment } = req.body;
  db.prepare('INSERT INTO comments (user_id, content) VALUES (?, ?)').run(userId, comment);
  res.json({ message: 'Kommentar gespeichert' });
});

app.get('/api/comments', (req, res) => {
  res.json(db.prepare('SELECT * FROM comments').all());
});

app.get('/api/user/:id/score', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ message: 'User nicht gefunden' });
  const activity = db.prepare('SELECT COUNT(*) as cnt FROM user_tracking WHERE user_id = ?').get(req.params.id);
  const score = activity.cnt > 5 ? 'vertrauenswuerdig' : 'neu';
  res.json({
    userId: req.params.id,
    bewertung: score,
    profil: { email: user.email, adresse: user.address, gesundheit: user.health_info }
  });
});

app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
  console.log(`Admin-Passwort: ${DB_ADMIN_PASSWORD}`);
});
