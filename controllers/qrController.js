const QRCode = require('qrcode');
const Session = require('../models/Session');

// @desc    Generate fresh QR code for a session
// @route   GET /api/qr/generate/:sessionId
// @access  Private (Teacher)
exports.generateFreshQR = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Verify teacher owns the session
    if (session.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to generate QR for this session'
      });
    }

    // Create QR data with current timestamp
    const qrData = {
      sessionId: session.sessionId,
      subject: session.subject,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      teacherName: session.teacherName,
      timestamp: Date.now() // Fresh timestamp for each QR
    };

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2
    });

    res.status(200).json({
      success: true,
      qrCode: qrCodeDataURL,
      timestamp: qrData.timestamp
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating QR code'
    });
  }
};

