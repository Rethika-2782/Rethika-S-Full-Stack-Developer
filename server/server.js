const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => console.warn('MongoDB connection note: Make sure MongoDB is running or configure MONGO_URI in .env. Falling back gracefully. Error:', err.message));

// Message Schema
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  clientTheme: { type: String, default: 'daylight-heritage' }
});

const Message = mongoose.model('Message', messageSchema);

// In-memory fallback if MongoDB local service is temporarily offline
const memoryStore = [];

// Contact Route
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message, theme } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields (name, email, message).' });
    }

    let savedMessage = null;
    if (mongoose.connection.readyState === 1) {
      const newMsg = new Message({
        name,
        email,
        subject: subject || 'General Inquiry',
        message,
        clientTheme: theme || 'daylight-heritage'
      });
      savedMessage = await newMsg.save();
    } else {
      savedMessage = {
        _id: 'local_' + Date.now(),
        name,
        email,
        subject: subject || 'General Inquiry',
        message,
        submittedAt: new Date(),
        clientTheme: theme || 'daylight-heritage',
        note: 'Stored locally in session memory (configure active MongoDB URI to persist across restarts)'
      };
      memoryStore.push(savedMessage);
    }

    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been received with high priority.',
      data: savedMessage
    });
  } catch (err) {
    console.error('Contact route error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error processing contact submission.' });
  }
});

// GET all messages endpoint (for admin review)
app.get('/api/contact/messages', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const messages = await Message.find().sort({ submittedAt: -1 }).limit(50);
      return res.json({ success: true, count: messages.length, messages });
    } else {
      return res.json({ success: true, count: memoryStore.length, messages: memoryStore });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected/standby',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Portfolio MongoDB API Server running on port ${PORT}`);
});
