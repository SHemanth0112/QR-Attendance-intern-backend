const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/session');
const attendanceRoutes = require('./routes/attendance');
const qrRoutes = require('./routes/qr');

const app = express();

// Middleware
// Configure CORS to allow requests from your frontend
const corsOptions = {
  origin: [
    'http://localhost:4200', // Local development
    'https://qr-attendance-intern-frontend.vercel.app', // Your deployed frontend (update this URL when you deploy)
    /\.vercel\.app$/ // Allow any Vercel preview deployments
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qr-attendance';

// Connect to MongoDB (don't exit on failure in serverless environment)
mongoose.connect(MONGODB_URI, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    // Don't exit in serverless environment - let individual requests fail gracefully
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  });

// Root route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'QR Attendance System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      sessions: '/api/sessions/*',
      attendance: '/api/attendance/*',
      qr: '/api/qr/*'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/qr', qrRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'Server is running', 
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in serverless environment (Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
