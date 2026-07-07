import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ToastContainer from '@/components/common/Toast';
import LoginPage from '@/pages/LoginPage';
import WaiterPage from '@/pages/WaiterPage';
import KitchenPage from '@/pages/KitchenPage';
import BarPage from '@/pages/BarPage';
import DashboardPage from '@/pages/DashboardPage';
import { useAuth } from '@/contexts/AuthContext';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'admin': return <Navigate to="/dashboard" replace />;
      case 'kitchen': return <Navigate to="/kitchen" replace />;
      case 'bar': return <Navigate to="/bar" replace />;
      case 'waiter': return <Navigate to="/waiter" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }
  return <>{children}</>;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>;
  }

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/kitchen" element={
          <ProtectedRoute allowedRoles={['kitchen']}><KitchenPage /></ProtectedRoute>
        } />
        <Route path="/bar" element={
          <ProtectedRoute allowedRoles={['bar']}><BarPage /></ProtectedRoute>
        } />
        <Route path="/waiter" element={
          <ProtectedRoute allowedRoles={['waiter']}><WaiterPage /></ProtectedRoute>
        } />

        <Route path="*" element={
          !user ? <Navigate to="/login" replace /> : (
            <Navigate to={
              user.role === 'admin' ? '/dashboard' :
              user.role === 'kitchen' ? '/kitchen' :
              user.role === 'bar' ? '/bar' :
              '/waiter'
            } replace />
          )
        } />
      </Routes>
    </>
  );
}
