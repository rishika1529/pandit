const fs = require('fs');
const Recording = require('../models/Recording');

/**
 * Transcribe an audio file using OpenAI Whisper API.
 * Updates the recording document with the transcription result.
 *
 * @param {string} filePath - Absolute path to the audio file
 * @param {string} recordingId - MongoDB ObjectId of the recording
 */
const transcribeAudio = async (filePath, recordingId) => {
  if (!process.env.OPENAI_API_KEY) {
    console.log('OpenAI API key not configured — skipping transcription');
    return;
  }

  try {
    // Lazy-load OpenAI to avoid crash when key is not set
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    console.log(`🎙️  Starting transcription for recording: ${recordingId}`);

    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      response_format: 'text',
    });

    await Recording.findByIdAndUpdate(recordingId, {
      transcription: response,
      transcriptionStatus: 'completed',
    });

    console.log(`✅ Transcription completed for recording: ${recordingId}`);
  } catch (error) {
    console.error(`❌ Transcription failed for recording ${recordingId}:`, error.message);
    await Recording.findByIdAndUpdate(recordingId, {
      transcriptionStatus: 'failed',
    });
    throw error;
  }
};

module.exports = { transcribeAudio };
