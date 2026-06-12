const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Recording title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [100, 'Client name cannot exceed 100 characters'],
    },
    consultationDate: {
      type: Date,
      required: [true, 'Consultation date is required'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
      default: '',
    },
    filePath: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in seconds (optional, populated client-side)
      default: null,
    },
    transcription: {
      type: String,
      default: null,
    },
    transcriptionStatus: {
      type: String,
      enum: ['none', 'pending', 'completed', 'failed'],
      default: 'none',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for fast search/filter
recordingSchema.index({ clientName: 1 });
recordingSchema.index({ title: 'text', clientName: 'text', notes: 'text' });
recordingSchema.index({ uploadedBy: 1, createdAt: -1 });

module.exports = mongoose.model('Recording', recordingSchema);
