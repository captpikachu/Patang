const HistoryPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-1">My History</h1>
      <p className="text-text-secondary mb-6">View your past bookings, access logs, and penalties.</p>
      <div className="flex gap-3 mb-6">
        {['Sports', 'Gym / Swimming', 'Penalties'].map(tab => (
          <button key={tab} className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-light border border-white/5 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
            {tab}
          </button>
        ))}
      </div>
      <div className="bg-surface-light rounded-xl border border-white/5 p-6">
        <p className="text-text-secondary">Select a tab to view history records.</p>
      </div>
    </div>
  );
};
export default HistoryPage;
