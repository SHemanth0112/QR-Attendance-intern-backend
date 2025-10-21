const express = require('express');
const router = express.Router();
const { generateFreshQR } = require('../controllers/qrController');
const { protect, authorize } = require('../middleware/auth');

// Teacher only - generate fresh QR
router.get('/generate/:sessionId', protect, authorize('teacher'), generateFreshQR);

module.exports = router;

