require('dotenv').config();

const path = require('path');
const fs = require('fs/promises');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;
const dataPath = path.join(__dirname, 'data', 'profile.json');
const jwtSecret = process.env.JWT_SECRET || 'local-development-secret-change-me';

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD)) {
  throw new Error('JWT_SECRET and ADMIN_PASSWORD must be configured in production.');
}

const profileSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'main' },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });
const Profile = mongoose.model('Profile', profileSchema);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

async function readLocalProfile() {
  return JSON.parse(await fs.readFile(dataPath, 'utf8'));
}

async function getProfile() {
  if (mongoose.connection.readyState === 1) {
    const record = await Profile.findOne({ key: 'main' }).lean();
    if (record) return record.data;
  }
  return readLocalProfile();
}

async function saveProfile(data) {
  if (mongoose.connection.readyState === 1) {
    await Profile.findOneAndUpdate({ key: 'main' }, { key: 'main', data }, { upsert: true, new: true });
    return;
  }
  await fs.writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function requireAuth(req, res, next) {
  const cookies = Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((part) => {
    const [key, ...value] = part.trim().split('=');
    return [key, decodeURIComponent(value.join('='))];
  }));
  const token = cookies.profile_admin || req.headers.authorization?.replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Authentication required.' });
  }
}

app.get('/api/profile', async (req, res) => {
  try {
    res.json(await getProfile());
  } catch (error) {
    res.status(500).json({ error: 'Could not load profile.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const password = String(req.body?.password || '');
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword || !(await bcrypt.compare(password, await bcrypt.hash(configuredPassword, 10)))) {
    return res.status(401).json({ error: 'Invalid password.' });
  }
  const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '8h' });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `profile_admin=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Max-Age=28800; Path=/${secure}`);
  res.json({ ok: true });
});

app.post('/api/auth/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'profile_admin=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/');
  res.json({ ok: true });
});

app.put('/api/profile', requireAuth, async (req, res) => {
  const data = req.body;
  if (!data || typeof data.name !== 'string' || typeof data.email !== 'string') {
    return res.status(400).json({ error: 'Name and email are required.' });
  }
  try {
    await saveProfile(data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Could not save profile.' });
  }
});

app.use(express.static(__dirname));

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB Atlas.');
    } catch (error) {
      console.error('MongoDB connection failed; using local JSON fallback.', error.message);
    }
  } else {
    console.log('MONGODB_URI is not set; using data/profile.json.');
  }
  app.listen(port, () => console.log(`Profile site running at http://localhost:${port}`));
}

start();
