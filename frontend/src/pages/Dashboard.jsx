import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import Spinner from '../components/Spinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/recordings/stats');
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const filteredRecent = stats?.recentUploads?.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, <span className="gradient-text">{user?.name}</span>
        </h1>
        <p className="text-dark-300 mt-1">Here's an overview of your consultation recordings</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          }
          label="Total Recordings"
          value={stats?.totalRecordings ?? 0}
          gradient="from-primary-600/20 to-primary-600/5"
          borderColor="border-primary-600/30"
          textColor="text-primary-400"
        />
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label="Total Clients"
          value={stats?.totalClients ?? 0}
          gradient="from-accent-emerald/20 to-accent-emerald/5"
          borderColor="border-accent-emerald/30"
          textColor="text-accent-emerald"
        />
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          }
          label="Recent Uploads"
          value={stats?.recentUploads?.length ?? 0}
          gradient="from-accent-amber/20 to-accent-amber/5"
          borderColor="border-accent-amber/30"
          textColor="text-accent-amber"
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/upload" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Recording
        </Link>
        <Link to="/recordings" className="btn-secondary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          View All
        </Link>
      </div>

      {/* Recent recordings */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="section-heading">Recent Uploads</h2>
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search recent…"
            className="sm:w-72"
          />
        </div>

        {filteredRecent.length === 0 ? (
          <div className="text-center py-12 text-dark-300">
            <svg className="w-16 h-16 mx-auto mb-4 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <p className="text-lg font-medium">No recordings yet</p>
            <p className="text-sm mt-1">Upload your first consultation recording to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecent.map((rec) => (
              <Link
                key={rec._id}
                to={`/recordings/${rec._id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-dark-700/40 border border-dark-600/30 hover:border-primary-600/30 hover:bg-dark-700/60 transition-all group"
              >
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary-600/30 to-accent-purple/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors truncate">
                    {rec.title}
                  </p>
                  <p className="text-xs text-dark-300 mt-0.5">{rec.clientName}</p>
                </div>
                <div className="text-xs text-dark-400 shrink-0 hidden sm:block">
                  {formatDate(rec.createdAt)}
                </div>
                <svg className="w-4 h-4 text-dark-400 group-hover:text-primary-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* Stat card component */
const StatCard = ({ icon, label, value, gradient, borderColor, textColor }) => (
  <div className={`glass-card p-5 border ${borderColor} bg-gradient-to-br ${gradient}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-dark-300 mb-1">{label}</p>
        <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl ${textColor} bg-dark-800/60 flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);

export default Dashboard;
