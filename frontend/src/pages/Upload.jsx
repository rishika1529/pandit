import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    clientName: '',
    consultationDate: '',
    notes: '',
  });
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/m4a', 'audio/x-m4a'];
  const allowedExtensions = ['.mp3', '.wav', '.m4a'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validateFile = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(f.type) && !allowedExtensions.includes(ext)) {
      return 'Only .mp3, .wav, and .m4a files are allowed.';
    }
    if (f.size > 100 * 1024 * 1024) {
      return 'File size exceeds 100MB limit.';
    }
    return null;
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const err = validateFile(droppedFile);
      if (err) { setError(err); return; }
      setFile(droppedFile);
      setError('');
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const err = validateFile(selected);
      if (err) { setError(err); return; }
      setFile(selected);
      setError('');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select an audio file.'); return; }
    setUploading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('title', form.title);
    formData.append('clientName', form.clientName);
    formData.append('consultationDate', form.consultationDate);
    formData.append('notes', form.notes);

    try {
      await api.post('/recordings/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgress(pct);
        },
      });
      navigate('/recordings');
    } catch (err) {
      const msg = err.response?.data?.errors
        ? err.response.data.errors.map((e) => e.msg).join('. ')
        : err.response?.data?.message || 'Upload failed. Please try again.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <div className="mb-8">
        <h1 className="section-heading">Upload Recording</h1>
        <p className="text-dark-300 text-sm mt-1">Upload a consultation audio file with its metadata.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Dropzone */}
        <div className="glass-card p-6">
          <label className="form-label mb-3">Audio File *</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              dragOver
                ? 'dropzone-active'
                : file
                ? 'border-accent-emerald/50 bg-accent-emerald/5'
                : 'border-dark-500 hover:border-dark-400 hover:bg-dark-700/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a,audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {file ? (
              <div className="space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-emerald/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-dark-300 text-sm">{formatFileSize(file.size)}</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-dark-700 flex items-center justify-center">
                  <svg className="w-7 h-7 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-dark-200 font-medium">Drop your audio file here</p>
                <p className="text-dark-400 text-sm">or click to browse · .mp3, .wav, .m4a · Max 100MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Recording Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="upload-title" className="form-label">Title *</label>
              <input
                id="upload-title"
                name="title"
                type="text"
                required
                maxLength={150}
                value={form.title}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Initial Consultation"
              />
            </div>
            <div>
              <label htmlFor="upload-client" className="form-label">Client Name *</label>
              <input
                id="upload-client"
                name="clientName"
                type="text"
                required
                maxLength={100}
                value={form.clientName}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. John Smith"
              />
            </div>
          </div>

          <div>
            <label htmlFor="upload-date" className="form-label">Consultation Date *</label>
            <input
              id="upload-date"
              name="consultationDate"
              type="date"
              required
              value={form.consultationDate}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="upload-notes" className="form-label">Notes <span className="text-dark-400">(optional)</span></label>
            <textarea
              id="upload-notes"
              name="notes"
              rows={4}
              maxLength={5000}
              value={form.notes}
              onChange={handleChange}
              className="input-field resize-y"
              placeholder="Add any relevant notes about the consultation…"
            />
          </div>
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-200 font-medium">Uploading…</span>
              <span className="text-sm text-primary-400 font-mono">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-dark-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-purple rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={uploading} className="btn-primary !py-3 flex-1">
            {uploading ? (
              <>
                <Spinner size="sm" />
                Uploading…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Recording
              </>
            )}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary !py-3" disabled={uploading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Upload;
