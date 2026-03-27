import React from 'react';
import SubscriptionScannerPage from '../../components/admin/SubscriptionScannerPage';

const SwimAdminScannerPage = () => (
  <SubscriptionScannerPage
    title="Pool Access Scanner"
    description="Scan or enter student access passes to verify swimming pool entry."
    manualPlaceholder="e.g. POOL-2026-001"
    theme="blue"
  />
);

export default SwimAdminScannerPage;
