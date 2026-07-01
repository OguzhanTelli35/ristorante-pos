import React from 'react';
import StationPanel from '@/components/station/StationPanel';
import AppLayout from '@/layouts/AppLayout';

export default function KitchenPage() {
  return (
    <AppLayout>
      <StationPanel
        destination="kitchen"
        title="Kitchen"
        icon="🔥"
        accentColor="orange"
        gradientFrom="from-orange-500"
        gradientTo="to-red-600"
      />
    </AppLayout>
  );
}
