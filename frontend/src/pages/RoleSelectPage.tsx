import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '@/hooks/useResponsive';

const roles = [
  {
    id: 'dashboard',
    name: 'All Panels',
    description: 'Multi-panel desktop view',
    icon: '🖥️',
    gradient: 'from-slate-500 to-slate-700',
    path: '/dashboard',
    desktopOnly: true,
  },
  {
    id: 'waiter',
    name: 'Waiter',
    description: 'Take orders for tables',
    icon: '📝',
    gradient: 'from-blue-500 to-blue-700',
    path: '/waiter',
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    description: 'View food tickets',
    icon: '🔥',
    gradient: 'from-orange-500 to-red-600',
    path: '/kitchen',
  },
  {
    id: 'bar',
    name: 'Bar',
    description: 'View drink tickets',
    icon: '🍹',
    gradient: 'from-cyan-500 to-teal-600',
    path: '/bar',
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Manage payments & tables',
    icon: '💶',
    gradient: 'from-emerald-500 to-green-700',
    path: '/manager',
  },
];

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const { isDesktop } = useResponsive();

  const visibleRoles = roles.filter((r) => !r.desktopOnly || isDesktop);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-2xl shadow-amber-500/20 mx-auto mb-4">
            R
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Ristorante POS
          </h1>
          <p className="text-xs text-slate-500 mt-1">Select your station to begin</p>
        </div>

        {/* Role Cards */}
        <div className="space-y-2">
          {visibleRoles.map((role, idx) => (
            <button
              key={role.id}
              onClick={() => navigate(role.path)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-700/30 hover:bg-slate-800/70 hover:border-slate-600/40 transition-all duration-200 group animate-slide-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform`}
              >
                {role.icon}
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-bold text-white">{role.name}</div>
                <div className="text-[11px] text-slate-400">{role.description}</div>
              </div>
              <svg
                className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
