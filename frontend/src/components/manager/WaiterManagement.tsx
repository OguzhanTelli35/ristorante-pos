import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type { User, CreateWaiterRequest, UpdateWaiterRequest } from '@ristorante/shared';

export default function WaiterManagement() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: waiters = [], isLoading } = useQuery({
    queryKey: ['waiters'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: User[] }>('/auth/waiters');
      return res.data.data;
    },
  });

  const createWaiter = useMutation({
    mutationFn: async (data: CreateWaiterRequest) => {
      await api.post('/auth/waiters', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiters'] });
      setIsAdding(false);
      setNewFullName('');
      setNewUsername('');
      setNewPassword('');
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to create waiter');
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await api.patch(`/auth/waiters/${id}`, { active } as UpdateWaiterRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiters'] });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newUsername || !newPassword) return;
    createWaiter.mutate({
      fullName: newFullName,
      username: newUsername,
      password: newPassword,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-300">Staff Accounts</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-pos bg-amber-500/10 text-amber-400 border border-amber-500/25 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-500/20"
        >
          {isAdding ? 'Cancel' : '+ Add Waiter'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/40 animate-slide-in">
          {error && <div className="text-red-400 text-xs mb-3 font-semibold">{error}</div>}
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="e.g. John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="e.g. jdoe"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={createWaiter.isPending}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-2 rounded-lg text-xs shadow-lg mt-2"
            >
              {createWaiter.isPending ? 'Saving...' : 'Save Waiter'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-xs text-slate-500 text-center py-4">Loading staff...</div>
      ) : (
        <div className="space-y-2">
          {waiters.map(waiter => (
            <div key={waiter.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">{waiter.fullName}</div>
                <div className="text-xs text-slate-400 mt-0.5">@{waiter.username}</div>
              </div>
              <button
                onClick={() => toggleStatus.mutate({ id: waiter.id, active: !waiter.active })}
                disabled={toggleStatus.isPending}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                  waiter.active 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20' 
                    : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:bg-slate-700'
                }`}
              >
                {waiter.active ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
