const express = require('express');
const { body } = require('express-validator');
const {
  uploadRecording,
  getRecordings,
  getRecordingById,
  deleteRecording,
  getStats,
} = require('../controllers/recordingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation for recording metadata
const recordingValidation = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 150 }).withMessage('Title too long'),
  body('clientName').trim().notEmpty().withMessage('Client name is required')
    .isLength({ max: 100 }).withMessage('Client name too long'),
  body('consultationDate').notEmpty().withMessage('Consultation date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('notes').optional().isLength({ max: 5000 }).withMessage('Notes too long'),
];

router.get('/stats', getStats);
router.post('/upload', upload.single('audio'), recordingValidation, uploadRecording);
router.get('/', getRecordings);
router.get('/:id', getRecordingById);
router.delete('/:id', deleteRecording);

module.exports = router;
