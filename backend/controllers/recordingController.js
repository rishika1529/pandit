const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Recording = require('../models/Recording');
const { transcribeAudio } = require('../utils/transcribe');

// @desc    Upload a new recording
// @route   POST /api/recordings/upload
// @access  Private
const uploadRecording = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file uploaded' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, clientName, consultationDate, notes } = req.body;

    const recording = await Recording.create({
      title,
      clientName,
      consultationDate: new Date(consultationDate),
      notes: notes || '',
      filePath: req.file.path.replace(/\\/g, '/'),
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id,
      transcriptionStatus: process.env.OPENAI_API_KEY ? 'pending' : 'none',
    });

    // Optionally kick off async transcription (non-blocking)
    if (process.env.OPENAI_API_KEY) {
      transcribeAudio(req.file.path, recording._id).catch((err) =>
        console.error('Transcription error:', err.message)
      );
    }

    res.status(201).json({
      success: true,
      message: 'Recording uploaded successfully',
      recording,
    });
  } catch (error) {
    // Clean up file on DB error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get all recordings (paginated, searchable)
// @route   GET /api/recordings
// @access  Private
const getRecordings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      clientName = '',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = { uploadedBy: req.user.id };

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    if (clientName.trim()) {
      query.clientName = { $regex: clientName, $options: 'i' };
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const validSortFields = ['createdAt', 'title', 'clientName', 'consultationDate'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [recordings, total] = await Promise.all([
      Recording.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .populate('uploadedBy', 'name email'),
      Recording.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: recordings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single recording
// @route   GET /api/recordings/:id
// @access  Private
const getRecordingById = async (req, res, next) => {
  try {
    const recording = await Recording.findOne({
      _id: req.params.id,
      uploadedBy: req.user.id,
    }).populate('uploadedBy', 'name email');

    if (!recording) {
      return res.status(404).json({ success: false, message: 'Recording not found' });
    }

    res.json({ success: true, recording });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a recording
// @route   DELETE /api/recordings/:id
// @access  Private
const deleteRecording = async (req, res, next) => {
  try {
    const recording = await Recording.findOne({
      _id: req.params.id,
      uploadedBy: req.user.id,
    });

    if (!recording) {
      return res.status(404).json({ success: false, message: 'Recording not found' });
    }

    // Delete the file from disk
    const absolutePath = path.resolve(recording.filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await recording.deleteOne();

    res.json({ success: true, message: 'Recording deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/recordings/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [total, recent, clientList] = await Promise.all([
      Recording.countDocuments({ uploadedBy: userId }),
      Recording.find({ uploadedBy: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title clientName consultationDate createdAt fileName mimeType'),
      Recording.distinct('clientName', { uploadedBy: userId }),
    ]);

    res.json({
      success: true,
      stats: {
        totalRecordings: total,
        totalClients: clientList.length,
        recentUploads: recent,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadRecording,
  getRecordings,
  getRecordingById,
  deleteRecording,
  getStats,
};
