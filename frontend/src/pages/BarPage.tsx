import React from 'react';
import StationPanel from '@/components/station/StationPanel';
import AppLayout from '@/layouts/AppLayout';

export default function BarPage() {
  return (
    <AppLayout>
      <StationPanel
        destination="bar"
        title="Bar"
        icon="🍹"
        accentColor="cyan"
        gradientFrom="from-cyan-500"
        gradientTo="to-teal-600"
      />
    </AppLayout>
  );
}
