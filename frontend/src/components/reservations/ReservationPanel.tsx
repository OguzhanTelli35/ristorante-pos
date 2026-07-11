import React, { useState, useMemo } from 'react';
import { 
  useReservations, 
  useCreateReservation, 
  useUpdateReservation, 
  useDeleteReservation,
  useSeatReservationGuests
} from '@/hooks/useReservations';
import { Reservation, ReservationStatus } from '@ristorante/shared';
import SearchInput from '@/components/common/SearchInput';
import EmptyState from '@/components/common/EmptyState';
import ReservationCalendar from './ReservationCalendar';

export default function ReservationPanel({ onHighlightTable }: { onHighlightTable?: (num: number) => void }) {
  const { data: reservations = [], isLoading } = useReservations();
  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();
  const deleteReservation = useDeleteReservation();
  const seatGuests = useSeatReservationGuests();

  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Reservation | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    tableNumber: 1,
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '19:00',
    guestCount: 2,
    status: 'pending' as ReservationStatus,
    notes: ''
  });

  const handleOpenModal = (item?: Reservation, presetDate?: string) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        customerName: item.customerName,
        phoneNumber: item.phoneNumber || '',
        tableNumber: item.tableNumber,
        reservationDate: item.reservationDate,
        reservationTime: item.reservationTime,
        guestCount: item.guestCount,
        status: item.status,
        notes: item.notes || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        customerName: '',
        phoneNumber: '',
        tableNumber: 1,
        reservationDate: presetDate || new Date().toISOString().split('T')[0],
        reservationTime: '19:00',
        guestCount: 2,
        status: 'pending',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateReservation.mutate({ id: editingItem.id, data: formData }, {
        onSuccess: handleCloseModal
      });
    } else {
      createReservation.mutate(formData, {
        onSuccess: handleCloseModal
      });
    }
  };

  // Grouping Logic
  const groupedReservations = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const filtered = reservations.filter(r => {
      const matchesSearch = r.customerName.toLowerCase().includes(search.toLowerCase()) || 
                            (r.phoneNumber || '').includes(search) ||
                            String(r.tableNumber).includes(search);
      const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    const groups: Record<string, Reservation[]> = {
      'Upcoming': [],
      'Today': [],
      'Tomorrow': [],
      'Future': [],
      'Past': []
    };

    filtered.forEach(r => {
      const rDate = new Date(`${r.reservationDate}T${r.reservationTime}`);
      const rDateOnly = new Date(r.reservationDate);
      rDateOnly.setHours(0,0,0,0);

      if (rDateOnly.getTime() < today.getTime()) {
        groups['Past'].push(r);
      } else if (rDateOnly.getTime() === today.getTime()) {
        groups['Today'].push(r);
        groups['Upcoming'].push(r);
      } else if (rDateOnly.getTime() === tomorrow.getTime()) {
        groups['Tomorrow'].push(r);
        groups['Upcoming'].push(r);
      } else if (rDateOnly.getTime() < nextWeek.getTime()) {
        groups['Upcoming'].push(r);
      } else {
        groups['Future'].push(r);
      }
    });

    // Sort each group
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => {
        const da = new Date(`${a.reservationDate}T${a.reservationTime}`).getTime();
        const db = new Date(`${b.reservationDate}T${b.reservationTime}`).getTime();
        return da - db;
      });
    }

    return groups;
  }, [reservations, search, filterStatus]);

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    'Past': true,
    'Future': true,
  });

  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">Confirmed</span>;
      case 'seated': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">Seated</span>;
      case 'cancelled': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider">Cancelled</span>;
      case 'completed': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30 uppercase tracking-wider">Completed</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">Pending</span>;
    }
  };

  const renderGroup = (title: string, items: Reservation[]) => {
    if (items.length === 0 && title !== 'Upcoming') return null;
    const isCollapsed = collapsedGroups[title];

    return (
      <div key={title} className="mb-6">
        <button 
          onClick={() => toggleGroup(title)}
          className="flex items-center gap-2 text-white font-bold text-lg mb-3 hover:text-blue-400 transition-colors"
        >
          <svg className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          {title} <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{items.length}</span>
        </button>
        
        {!isCollapsed && (
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="text-sm text-slate-500 italic px-6">No reservations in this period.</div>
            ) : (
              items.map(res => (
                <div key={res.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center bg-slate-800 w-16 h-16 rounded-xl border border-slate-700 shadow-inner">
                      <span className="text-xs font-bold text-blue-400 uppercase">{new Date(res.reservationDate).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-xl font-black text-white">{new Date(res.reservationDate).getDate()}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold text-white">{res.customerName}</span>
                        {getStatusBadge(res.status)}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span className="flex items-center gap-1">🕒 {res.reservationTime}</span>
                        <span className="flex items-center gap-1">🍽 Table {res.tableNumber}</span>
                        <span className="flex items-center gap-1">👥 {res.guestCount} Guests</span>
                        {res.phoneNumber && <span className="flex items-center gap-1">📱 {res.phoneNumber}</span>}
                      </div>
                      {res.notes && (
                        <div className="text-[10px] mt-1.5 text-slate-500 italic bg-slate-950/50 px-2 py-1 rounded inline-block">
                          {res.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex items-center gap-2">
                    {onHighlightTable && (
                      <button onClick={() => onHighlightTable(res.tableNumber)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs font-bold" title="View on Map">
                        📍 Map
                      </button>
                    )}
                    {(res.status === 'confirmed' || res.status === 'pending') && (
                      <button 
                        onClick={() => seatGuests.mutate(res.id)}
                        disabled={seatGuests.isPending}
                        className="px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors text-xs font-bold shadow-lg shadow-orange-500/20"
                      >
                        Seat Guests
                      </button>
                    )}
                    <button onClick={() => handleOpenModal(res)} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-xs font-bold shadow-lg shadow-blue-500/20">
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="p-8 text-slate-400">Loading reservations...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📅</span> Reservation Management
          </h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <span>+</span> New Reservation
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-4 flex gap-4 border-b border-slate-800/50 bg-slate-900/20 items-center">
        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            List View
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeTab === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Calendar View
          </button>
        </div>
        
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} accentColor="blue" placeholder="Search customer, phone, table..." />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-40"
        >
          <option value="All">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="seated">Seated</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'list' ? (
          <>
            {renderGroup('Upcoming', groupedReservations['Upcoming'])}
            {renderGroup('Today', groupedReservations['Today'])}
            {renderGroup('Tomorrow', groupedReservations['Tomorrow'])}
            {renderGroup('Future', groupedReservations['Future'])}
            {renderGroup('Past', groupedReservations['Past'])}
          </>
        ) : (
          <ReservationCalendar 
            reservations={reservations} 
            onSelectDate={(d) => handleOpenModal(undefined, d)}
            onSelectReservation={(r) => handleOpenModal(r)}
          />
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">{editingItem ? 'Edit Reservation' : 'New Reservation'}</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="e.g. 555-0101"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Guest Count</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.guestCount}
                    onChange={e => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.reservationDate}
                    onChange={e => setFormData({ ...formData, reservationDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={formData.reservationTime}
                    onChange={e => setFormData({ ...formData, reservationTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Table #</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={formData.tableNumber}
                    onChange={e => setFormData({ ...formData, tableNumber: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as ReservationStatus })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="seated">Seated</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Birthday dinner"
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm font-bold hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                {editingItem && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete this reservation?')) {
                        deleteReservation.mutate(editingItem.id, { onSuccess: handleCloseModal });
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-bold transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  disabled={createReservation.isPending || updateReservation.isPending}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-colors"
                >
                  {editingItem ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
