import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ToastContainer from '@/components/common/Toast';
import RoleSelectPage from '@/pages/RoleSelectPage';
import WaiterPage from '@/pages/WaiterPage';
import KitchenPage from '@/pages/KitchenPage';
import BarPage from '@/pages/BarPage';
import ManagerPage from '@/pages/ManagerPage';
import DashboardPage from '@/pages/DashboardPage';

export default function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<RoleSelectPage />} />
        <Route path="/waiter" element={<WaiterPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/bar" element={<BarPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </>
  );
}
