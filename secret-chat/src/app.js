const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const messageController = require('./controllers/messageController');
const noteController = require('./controllers/noteController');
const tokenController = require('./controllers/tokenController');

const createApp = (io) => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
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
