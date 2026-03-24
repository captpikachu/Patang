const SlotBookingPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-1">Slot Booking</h1>
      <p className="text-text-secondary mb-6">Book sports facilities, gym, or swimming pool.</p>
      <div className="flex gap-3 mb-6">
        {['Sports', 'Gym', 'Swimming'].map(tab => (
          <button key={tab} className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-light border border-white/5 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
            {tab}
          </button>
        ))}
      </div>
      <div className="bg-surface-light rounded-xl border border-white/5 p-6">
        <p className="text-text-secondary">Select a tab to view available slots.</p>
      </div>
    </div>
  );
};
export default SlotBookingPage;
