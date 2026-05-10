const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const messageController = require('./controllers/messageController');
const noteController = require('./controllers/noteController');
const tokenController = require('./controllers/tokenController');

const createApp = (io) => {
  const app = express();

  // Middleware
  const allowedOrigins = ["https://calc-socket.vercel.app", "http://localhost:3000", "http://127.0.0.1:3000", "https://calc-socket-emmanuveleusebios-projects.vercel.app"];
  
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
  }));

  // Manual CORS injector (Fail-safe)
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  app.use(logger);
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Routes
  app.get('/messages', messageController.getMessages);
  app.post('/seen', (req, res) => messageController.markSeen(req, res, io));
  app.post('/save-token', tokenController.saveToken);
  app.get('/notes', noteController.getNotes);
  app.post('/notes', (req, res) => noteController.createNote(req, res, io));
  app.delete('/messages/:id', (req, res) => messageController.deleteMessage(req, res, io));

  // Health check
  app.get('/health', (req, res) => res.status(200).send('OK'));

  return app;
};

module.exports = createApp;
