const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getMyAttendance,
  checkAttendance,
  getSessionAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Student routes
router.post('/mark', authorize('student'), markAttendance);
router.get('/my-attendance', authorize('student'), getMyAttendance);
router.get('/check/:sessionId', authorize('student'), checkAttendance);

// Teacher routes
router.get('/session/:sessionId', authorize('teacher'), getSessionAttendance);

module.exports = router;

