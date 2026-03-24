const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-1">Dashboard</h1>
      <p className="text-text-secondary mb-6">Welcome back! Here's your overview.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['Subscriptions', 'Upcoming Bookings', 'Fair-Use Score', 'Active Penalties', 'Recent Access', 'Upcoming Events'].map(title => (
          <div key={title} className="bg-surface-light rounded-xl border border-white/5 p-5">
            <h3 className="text-sm font-medium text-text-muted mb-2">{title}</h3>
            <p className="text-text-secondary text-sm">Loading...</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default DashboardPage;
