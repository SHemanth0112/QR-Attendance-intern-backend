const Session = require('../models/Session');
const QRCode = require('qrcode');

// @desc    Create a new session (Teacher only)
// @route   POST /api/sessions
// @access  Private (Teacher)
exports.createSession = async (req, res) => {
  try {
    const { subject, date, startTime, endTime, description, venue, sessionId } = req.body;

    // Validation
    if (!subject || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject, date, start time, and end time'
      });
    }

    // Generate unique session ID if not provided
    const generatedSessionId = sessionId || `SES-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Check if session ID already exists
    const existingSession = await Session.findOne({ sessionId: generatedSessionId });
    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: 'Session ID already exists. Please use a different ID.'
      });
    }

    // Create session data object for QR code with timestamp
    const sessionData = {
      sessionId: generatedSessionId,
      subject,
      date,
      startTime,
      endTime,
      teacherName: req.user.name,
      teacherId: req.user.id,
      timestamp: Date.now() // For QR refresh verification
    };

    // Generate QR code as base64 image
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(sessionData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2
    });

    // Create session
    const session = await Session.create({
      sessionId: generatedSessionId,
      teacherId: req.user.id,
      teacherName: req.user.name,
      subject,
      date,
      startTime,
      endTime,
      description: description || '',
      venue: venue || '',
      qrCode: qrCodeDataURL
    });

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      session: {
        id: session._id,
        sessionId: session.sessionId,
        subject: session.subject,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        description: session.description,
        venue: session.venue,
        qrCode: session.qrCode,
        teacherName: session.teacherName,
        isActive: session.isActive,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Create session error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all sessions (for teachers - their own, for students - all active)
// @route   GET /api/sessions
// @access  Private
exports.getSessions = async (req, res) => {
  try {
    let query = {};

    // If teacher, show only their sessions
    if (req.user.role === 'teacher') {
      query.teacherId = req.user.id;
    } else {
      // If student, show only active sessions
      query.isActive = true;
    }

    const sessions = await Session.find(query)
      .sort({ date: -1, startTime: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions: sessions.map(session => ({
        id: session._id,
        sessionId: session.sessionId,
        subject: session.subject,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        description: session.description,
        venue: session.venue,
        qrCode: session.qrCode,
        teacherName: session.teacherName,
        isActive: session.isActive,
        attendanceCount: session.attendanceCount,
        createdAt: session.createdAt
      }))
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single session by ID
// @route   GET /api/sessions/:id
// @access  Private
exports.getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Teachers can only view their own sessions
    if (req.user.role === 'teacher' && session.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this session'
      });
    }

    res.status(200).json({
      success: true,
      session: {
        id: session._id,
        sessionId: session.sessionId,
        subject: session.subject,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        description: session.description,
        venue: session.venue,
        qrCode: session.qrCode,
        teacherName: session.teacherName,
        isActive: session.isActive,
        attendanceCount: session.attendanceCount,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update session (Teacher only)
// @route   PUT /api/sessions/:id
// @access  Private (Teacher)
exports.updateSession = async (req, res) => {
  try {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Make sure teacher owns the session
    if (session.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this session'
      });
    }

    const { subject, date, startTime, endTime, description, venue, isActive } = req.body;

    // Update fields
    if (subject) session.subject = subject;
    if (date) session.date = date;
    if (startTime) session.startTime = startTime;
    if (endTime) session.endTime = endTime;
    if (description !== undefined) session.description = description;
    if (venue !== undefined) session.venue = venue;
    if (isActive !== undefined) session.isActive = isActive;

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      session
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete session (Teacher only)
// @route   DELETE /api/sessions/:id
// @access  Private (Teacher)
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Make sure teacher owns the session
    if (session.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this session'
      });
    }

    await session.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Toggle session active status (Teacher only)
// @route   PATCH /api/sessions/:id/toggle
// @access  Private (Teacher)
exports.toggleSessionStatus = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Make sure teacher owns the session
    if (session.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this session'
      });
    }

    session.isActive = !session.isActive;
    await session.save();

    res.status(200).json({
      success: true,
      message: `Session ${session.isActive ? 'activated' : 'deactivated'} successfully`,
      session: {
        id: session._id,
        isActive: session.isActive
      }
    });
  } catch (error) {
    console.error('Toggle session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling session status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

