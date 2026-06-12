const sizes = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const Spinner = ({ size = 'md', className = '' }) => (
  <div className={`${sizes[size] || sizes.md} ${className}`} role="status">
    <svg className="animate-spin-slow w-full h-full" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-80"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        fill="url(#spinner-gradient)"
      />
      <defs>
        <linearGradient id="spinner-gradient" x1="0" y1="0" x2="12" y2="12">
          <stop stopColor="#6172f3" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
    <span className="sr-only">Loading…</span>
  </div>
);

export default Spinner;
