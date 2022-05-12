import dotenv from 'dotenv-flow';
dotenv.config();
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { basicAuth } from './auth.js';
import fs from 'fs';
import https from 'https';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const port = process.env.VCS_PORT || '3001';

console.log(`Running in ${process.env.NODE_ENV} mode`);

if (!process.env.VCS_HOST) {
  console.error('VCS_HOST env variable is missing.');
  process.exit(1);
}
console.log('VCS_HOST:', process.env.VCS_HOST);

if (!process.env.VCS_API_KEY) {
  console.error('VCS_API_KEY env variable is missing.');
  process.exit(1);
}
console.log('VCS_API_KEY:', process.env.VCS_API_KEY);
console.log('VCS_AUTH_TYPE:', process.env.VCS_AUTH_TYPE);
console.log('HTTPS:', process.env.HTTPS);
console.log('PORT:', port);

let notifyData;
if (fs.existsSync('../notifyData.js')) {
  try {
    notifyData = JSON.parse(fs.readFileSync('../notifyData.js').toString())
  } catch(err) {
    console.error(`Could not parse notifyData ${err.message}`);
  }
}

// Setup CORS to allow only origin
app.use(
  cors({
    origin: (origin, callback) => callback(null, [origin]),
    credentials: true
  })
);

if (process.env.NODE_ENV === 'production') {
  // Host web app
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
} else {
  // In development ignore certificate error
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Rooms: key=name
const rooms = {};

app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many accounts created from this IP, please try again after an hour'
  })
);

app.post('/api/room', basicAuth(), async (req, res) => {
  try {
    const room = rooms[req.body.name.toLowerCase()];
    if (room) {
      console.log(`[POST /api/room]: Reject creating room ${req.body.name} as it already exists.`);
      res.status(409).send(`Room "${req.body.name}" already exists`);
      return;
    }
    let result = await fetch(`https://${process.env.VCS_HOST}/api/realtime/room`, {
      method: 'post',
      headers: {
        'content-type': 'application/json',
        'x-vcs-token': process.env.VCS_API_KEY
      },
      body: JSON.stringify({ name: req.body.name, conferenceType: req.body.conferenceType })
    });
    if (!result.ok) {
      throw new Error(`${result.status} ${result.statusText}`);
    }
    result = await result.json();
    result.domain = process.env.VCS_HOST;
    rooms[result.room.name.toLowerCase()] = result;
    console.log(`[POST /api/room]: Created room ${result.room.name}. Returning:`, result);
    res.json(result);
  } catch (err) {
    console.error('[POST /api/room]: Error creating room.', err);
    res.status(500).send('Error creating room');
  }
});

app.get('/api/room', (req, res) => {
  if (req.query.name) {
    const room = rooms[req.query.name.toLowerCase()];
    if (!room) {
      console.log(`[GET /api/room]: Room ${req.query.name} not found`);
      res.sendStatus(404);
    } else {
      console.log(`[GET /api/room]: Room ${req.query.name} found`);
      res.json(room);
    }
  } else {
    console.error('[GET /api/room]: Error fetching room:', err);
    res.status(500).send('Missing parameter [name]');
  }
});

app.get('/api/rooms', (req, res) => {
  const r = Object.values(rooms);
  console.log(`[GET /api/rooms]: Returning ${r.length} room(s)`);
  res.json(r);
});

app.get('/api/config', (req, res) => {
  const config = {
    VCS_HOST: process.env.VCS_HOST,
    AUTH_TYPE: process.env.AUTH_TYPE || 'NONE'
  };
  notifyData && (config.NOTIFY_DATA = JSON.stringify(notifyData));
  console.log('Return configuration: ', config);
  res.json(config);
});

app.post('/api/notify', basicAuth(), async (req, res) => {
  try {
    const body = req.body;
    let result;
    if (body.chat_id) {
      console.log(`[POST /api/notify]: Telegram user[${body.chat_id}] url[${body.text}]`);
      result = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_CRED}/sendMessage`, {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    } else if (body.number) {
      console.log(`[POST /api/notify]: Twilio user[${body.number}] url[${body.text}]`);
      const authorization = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_ACCOUNT_TOKEN}`).toString('base64');
      result = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'post',
        headers: {
          'Authorization': `Basic ${authorization}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: `To=${encodeURIComponent(body.number)}&MessagingServiceSid=${encodeURIComponent(process.env.TWILIO_MESSAGE_SID)}&Body=${encodeURIComponent(body.text)}`
      });
    } else {
        throw new Error('Missing data for notification');
    }
    if (!result.ok) {
      throw new Error(`${result.status} ${result.statusText}`);
    }
    result = await result.json();
    res.json(result);
  } catch (err) {
    console.error('[POST /api/notify]: Error notifying user.', err && err.message);
    res.status(409).send('Error notifying user');
  }
});

// Return index.html for all other routes.
// E.g. user navigates to /room?id=abc directly
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
});

let options = null;
if (process.env.HTTPS) {
  https
    .createServer(
      {
        cert: fs.readFileSync(path.join(__dirname, './cert/tls.crt'), 'UTF-8'),
        key: fs.readFileSync(path.join(__dirname, './cert/tls.key'), 'UTF-8')
      },
      app
    )
    .listen(port, () => console.log(`Server running with https on port ${port}`));
} else {
  app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
}
