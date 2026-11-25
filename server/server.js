const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => console.warn('MongoDB connection note: Falling back to local storage. Error:', err.message));

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

// In-memory fallback if MongoDB is not reachable
const memoryStore = [];

// Optional Nodemailer transporter if email credentials are configured in .env
let transporter = null;
if (nodemailer && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

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
        note: 'Saved in memory'
      };
      memoryStore.push(savedMessage);
    }

    // Send email notification to Rethika if transporter is active
    if (transporter) {
      transporter.sendMail({
        from: `"Portfolio Concierge" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_NOTIFICATION_TO || 'rethikas2782@gmail.com',
        subject: `[Portfolio Contact] ${subject || 'New Message'} from ${name}`,
        html: `
          <h3>New Message Received via Portfolio</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Theme:</strong> ${theme}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #f4f4f4; padding: 12px; border-radius: 4px;">${message}</p>
        `
      }).catch(e => console.warn('Nodemailer error:', e.message));
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
