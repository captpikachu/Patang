const SettingsPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-1">Settings</h1>
      <p className="text-text-secondary mb-6">Manage your profile and account preferences.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {['Profile Information', 'Change Password', 'Account Status', 'Subscriptions'].map(title => (
          <div key={title} className="bg-surface-light rounded-xl border border-white/5 p-5">
            <h3 className="text-sm font-medium text-text-muted mb-2">{title}</h3>
            <p className="text-text-secondary text-sm">Loading...</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SettingsPage;
