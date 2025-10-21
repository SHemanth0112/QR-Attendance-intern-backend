const express = require('express');
const router = express.Router();
const {
  createSession,
  getSessions,
  getSession,
  updateSession,
  deleteSession,
  toggleSessionStatus
} = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Routes accessible by both teachers and students
router.get('/', getSessions);
router.get('/:id', getSession);

// Routes only for teachers
router.post('/', authorize('teacher'), createSession);
router.put('/:id', authorize('teacher'), updateSession);
router.delete('/:id', authorize('teacher'), deleteSession);
router.patch('/:id/toggle', authorize('teacher'), toggleSessionStatus);

module.exports = router;

