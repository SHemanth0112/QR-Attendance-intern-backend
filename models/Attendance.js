const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  sessionDetails: {
    sessionCode: String,
    subject: String,
    date: Date,
    startTime: String,
    endTime: String,
    teacherName: String
  },
  scannedAt: {
    type: Date,
    default: Date.now
  },
  qrTimestamp: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'late'],
    default: 'present'
  }
});

// Compound index to prevent duplicate attendance
attendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

