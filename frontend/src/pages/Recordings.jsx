import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import RecordingCard from '../components/RecordingCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';

const Recordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9, search };
      if (clientFilter) params.clientName = clientFilter;
      const { data } = await api.get('/recordings', { params });
      setRecordings(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load recordings:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, clientFilter]);

  // Fetch unique client list for filter
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await api.get('/recordings/stats');
        // Extract unique client names from recent + a broader approach
        const { data: allData } = await api.get('/recordings', { params: { limit: 50 } });
        const names = [...new Set(allData.data.map((r) => r.clientName))].sort();
        setClients(names);
      } catch {
        // ignore
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  const handleSearch = (query) => {
    setSearch(query);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/recordings/${deleteTarget}`);
      setDeleteTarget(null);
      fetchRecordings();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="section-heading">All Recordings</h1>
          <p className="text-dark-300 text-sm mt-1">
            {pagination ? `${pagination.total} recording${pagination.total !== 1 ? 's' : ''} total` : 'Loading…'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <SearchBar onSearch={handleSearch} className="flex-1" />
        <select
          id="client-filter"
          value={clientFilter}
          onChange={(e) => {
            setClientFilter(e.target.value);
            setPage(1);
          }}
          className="input-field !w-auto min-w-[180px]"
        >
          <option value="">All Clients</option>
          {clients.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : recordings.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <svg className="w-20 h-20 mx-auto mb-4 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">No recordings found</h3>
          <p className="text-dark-300">
            {search || clientFilter
              ? 'Try adjusting your search or filter.'
              : 'Upload your first recording to get started.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recordings.map((rec) => (
              <RecordingCard
                key={rec._id}
                recording={rec}
                onDelete={(id) => setDeleteTarget(id)}
              />
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Recording"
        message="This will permanently delete the recording and its audio file. This action cannot be undone."
        confirmText={deleting ? 'Deleting…' : 'Delete'}
        variant="danger"
      />
    </div>
  );
};

export default Recordings;
