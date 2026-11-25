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

// Helper to send transactional email via Brevo REST API (300 free emails/day)
async function sendBrevoEmail({ name, email, subject, message, theme }) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    console.log('Brevo note: BREVO_API_KEY not configured yet in .env');
    return false;
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'rethikas2782@gmail.com';
  const recipientEmail = process.env.NOTIFICATION_EMAIL || 'rethikas2782@gmail.com';

  const bodyData = {
    sender: { name: 'Portfolio Concierge', email: senderEmail },
    to: [{ email: recipientEmail, name: 'Rethika S' }],
    replyTo: { email: email, name: name },
    subject: `🏛️ [Portfolio Inquiry] ${subject || 'New Contact'} from ${name}`,
    htmlContent: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: #1C1917; padding: 24px; text-align: center; color: #C5A059;">
          <h2 style="margin: 0; font-family: Georgia, serif; letter-spacing: 0.05em;">RETHIKA S — ATELIER CONCIERGE</h2>
          <p style="margin: 6px 0 0; font-size: 13px; color: #a8a29e;">New priority inquiry received</p>
        </div>
        <div style="padding: 28px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px; width: 120px;"><strong>Client Name:</strong></td>
              <td style="padding: 8px 0; color: #18181b; font-size: 15px;"><strong>${name}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;"><strong>Client Email:</strong></td>
              <td style="padding: 8px 0; color: #0284c7; font-size: 15px;"><a href="mailto:${email}" style="color: #0284c7; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;"><strong>Subject:</strong></td>
              <td style="padding: 8px 0; color: #18181b; font-size: 15px;">${subject || 'General Inquiry'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;"><strong>Theme Viewed:</strong></td>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">${theme || 'Daylight Atelier'}</td>
            </tr>
          </table>

          <div style="background: #f8fafc; border-left: 4px solid #C5A059; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 600;">Message Content:</p>
            <p style="margin: 0; color: #334155; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Inquiry')}" style="display: inline-block; background: #C5A059; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">Reply Directly to ${name} ↗</a>
          </div>
        </div>
      </div>
    `
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    });
    const result = await response.json();
    console.log('Brevo transmission status:', response.status, result);
    return response.ok;
  } catch (err) {
    console.error('Brevo API network error:', err);
    return false;
  }
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

    // Dispatch via Brevo API
    await sendBrevoEmail({ name, email, subject, message, theme });

    // Optional Nodemailer fallback
    if (transporter) {
      transporter.sendMail({
        from: `"Portfolio Concierge" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_NOTIFICATION_TO || 'rethikas2782@gmail.com',
        subject: `[Portfolio Contact] ${subject || 'New Message'} from ${name}`,
        html: `<p><strong>${name}</strong> (${email}) sent: ${message}</p>`
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
