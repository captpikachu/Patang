import React from 'react';
import SubscriptionScannerPage from '../../components/admin/SubscriptionScannerPage';

const GymAdminScannerPage = () => (
  <SubscriptionScannerPage
    title="QR Access Scanner"
    description="Scan or enter student access passes to verify gym and pool entry."
    manualPlaceholder="e.g. GYM-12345"
    theme="brand"
  />
);

export default GymAdminScannerPage;
