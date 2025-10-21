const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: [true, 'Session ID is required'],
    unique: true,
    trim: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  teacherName: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Session date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  venue: {
    type: String,
    trim: true,
    default: ''
  },
  qrCode: {
    type: String, // Base64 encoded QR code image
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attendanceCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
sessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate a unique session ID if not provided
sessionSchema.pre('save', async function(next) {
  if (!this.sessionId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.sessionId = `SES-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Session', sessionSchema);

