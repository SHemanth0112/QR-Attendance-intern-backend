const Attendance = require('../models/Attendance');
const Session = require('../models/Session');

// @desc    Mark attendance by scanning QR code
// @route   POST /api/attendance/mark
// @access  Private (Student)
exports.markAttendance = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    // Parse QR data
    let sessionData;
    try {
      sessionData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format'
      });
    }

    const { sessionId, timestamp } = sessionData;

    if (!sessionId || !timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code - missing session data'
      });
    }

    // Check if QR code is fresh (within 10 seconds)
    const currentTime = Date.now();
    const qrAge = currentTime - timestamp;
    
    if (qrAge > 10000) { // 10 seconds
      return res.status(400).json({
        success: false,
        message: 'QR code expired. Please scan the latest QR code from teacher.'
      });
    }

    // Find the session
    const session = await Session.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (!session.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This session is no longer active'
      });
    }

    // Check if student already marked attendance
    const existingAttendance = await Attendance.findOne({
      sessionId: session._id,
      studentId: req.user.id
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'You have already marked attendance for this session',
        attendance: {
          scannedAt: existingAttendance.scannedAt,
          status: existingAttendance.status
        }
      });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      sessionId: session._id,
      studentId: req.user.id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      sessionDetails: {
        sessionCode: session.sessionId,
        subject: session.subject,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        teacherName: session.teacherName
      },
      qrTimestamp: timestamp,
      status: 'present'
    });

    // Update session attendance count
    session.attendanceCount += 1;
    await session.save();

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully!',
      attendance: {
        id: attendance._id,
        sessionCode: session.sessionId,
        subject: session.subject,
        scannedAt: attendance.scannedAt,
        status: attendance.status
      }
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already marked attendance for this session'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get student's attendance records
// @route   GET /api/attendance/my-attendance
// @access  Private (Student)
exports.getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.user.id })
      .populate('sessionId', 'sessionId subject date startTime endTime teacherName')
      .sort({ scannedAt: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance: attendance.map(record => ({
        id: record._id,
        sessionCode: record.sessionDetails.sessionCode,
        subject: record.sessionDetails.subject,
        date: record.sessionDetails.date,
        startTime: record.sessionDetails.startTime,
        endTime: record.sessionDetails.endTime,
        teacherName: record.sessionDetails.teacherName,
        scannedAt: record.scannedAt,
        status: record.status
      }))
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records'
    });
  }
};

// @desc    Check if student attended a specific session
// @route   GET /api/attendance/check/:sessionId
// @access  Private (Student)
exports.checkAttendance = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const attendance = await Attendance.findOne({
      sessionId: session._id,
      studentId: req.user.id
    });

    res.status(200).json({
      success: true,
      attended: !!attendance,
      attendance: attendance ? {
        scannedAt: attendance.scannedAt,
        status: attendance.status
      } : null
    });
  } catch (error) {
    console.error('Check attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking attendance'
    });
  }
};

// @desc    Get attendance list for a session (Teacher only)
// @route   GET /api/attendance/session/:sessionId
// @access  Private (Teacher)
exports.getSessionAttendance = async (req, res) => {
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
        message: 'Not authorized to view this session attendance'
      });
    }

    const attendance = await Attendance.find({ sessionId: session._id })
      .sort({ scannedAt: -1 });

    res.status(200).json({
      success: true,
      session: {
        sessionId: session.sessionId,
        subject: session.subject,
        date: session.date,
        attendanceCount: session.attendanceCount
      },
      count: attendance.length,
      students: attendance.map(record => ({
        id: record._id,
        studentName: record.studentName,
        studentEmail: record.studentEmail,
        scannedAt: record.scannedAt,
        status: record.status
      }))
    });
  } catch (error) {
    console.error('Get session attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching session attendance'
    });
  }
};

