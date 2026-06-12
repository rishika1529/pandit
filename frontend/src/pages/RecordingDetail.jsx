import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { getBackendUrl } from '../api/axios';
import AudioPlayer from '../components/AudioPlayer';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';

const RecordingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRecording();
  }, [id]);

  const fetchRecording = async () => {
    try {
      const { data } = await api.get(`/recordings/${id}`);
      setRecording(data.recording);
    } catch (err) {
      setError(err.response?.data?.message || 'Recording not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/recordings/${id}`);
      navigate('/recordings');
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-white mb-2">Error</h2>
        <p className="text-dark-300 mb-6">{error}</p>
        <Link to="/recordings" className="btn-primary">Back to Recordings</Link>
      </div>
    );
  }

  const audioUrl = getBackendUrl(`/uploads/${recording.fileName}`);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-dark-300 mb-6">
        <Link to="/recordings" className="hover:text-primary-400 transition-colors">Recordings</Link>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-dark-100 truncate max-w-[200px]">{recording.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — left 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Actions */}
          <div className="glass-card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{recording.title}</h1>
                <p className="text-dark-300 mt-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {recording.clientName}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <a
                  href={audioUrl}
                  download={recording.originalName}
                  className="btn-secondary !py-2 !px-3"
                  title="Download recording"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
                <button onClick={() => setShowDelete(true)} className="btn-danger !py-2 !px-3" title="Delete">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Audio Player */}
            <AudioPlayer src={audioUrl} title={recording.originalName} />
          </div>

          {/* Notes */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Notes
            </h2>
            {recording.notes ? (
              <p className="text-dark-200 leading-relaxed whitespace-pre-wrap">{recording.notes}</p>
            ) : (
              <p className="text-dark-400 italic">No notes for this recording.</p>
            )}
          </div>

          {/* Transcription */}
          {(recording.transcription || recording.transcriptionStatus === 'pending') && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Transcription
                {recording.transcriptionStatus === 'pending' && (
                  <span className="badge bg-accent-amber/20 text-accent-amber ml-2">Processing…</span>
                )}
                {recording.transcriptionStatus === 'completed' && (
                  <span className="badge bg-accent-emerald/20 text-accent-emerald ml-2">Complete</span>
                )}
                {recording.transcriptionStatus === 'failed' && (
                  <span className="badge bg-red-500/20 text-red-400 ml-2">Failed</span>
                )}
              </h2>
              {recording.transcription ? (
                <p className="text-dark-200 leading-relaxed whitespace-pre-wrap text-sm">{recording.transcription}</p>
              ) : recording.transcriptionStatus === 'pending' ? (
                <div className="flex items-center gap-3 text-dark-300">
                  <Spinner size="sm" />
                  <span>Transcription is being processed…</span>
                </div>
              ) : (
                <p className="text-dark-400 italic">Transcription failed.</p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar — right col */}
        <div className="space-y-6">
          {/* Metadata */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Details</h2>
            <div className="space-y-4">
              <MetaItem label="Consultation Date" value={formatDate(recording.consultationDate)} />
              <MetaItem label="Uploaded" value={formatDate(recording.createdAt)} />
              <MetaItem label="File Name" value={recording.originalName} />
              <MetaItem label="File Size" value={formatFileSize(recording.fileSize)} />
              <MetaItem label="Format" value={recording.mimeType} />
              <MetaItem
                label="Uploaded By"
                value={recording.uploadedBy?.name || 'Unknown'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Recording"
        message="This will permanently delete this recording and its audio file. This action cannot be undone."
        confirmText={deleting ? 'Deleting…' : 'Delete'}
        variant="danger"
      />
    </div>
  );
};

const MetaItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-dark-400 uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-sm text-dark-100 break-all">{value}</p>
  </div>
);

export default RecordingDetail;
