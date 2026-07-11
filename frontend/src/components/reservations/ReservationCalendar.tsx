import React, { useMemo, useState } from 'react';
import { Reservation } from '@ristorante/shared';

interface ReservationCalendarProps {
  reservations: Reservation[];
  onSelectDate: (date: string) => void;
  onSelectReservation: (res: Reservation) => void;
}

export default function ReservationCalendar({ reservations, onSelectDate, onSelectReservation }: ReservationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  
  // Adjust so Monday is first (optional, standard is Sunday first, we'll stick to Sunday first for simplicity)
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const getReservationsForDate = (day: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reservations.filter(r => r.reservationDate === dStr);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/80">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {monthNames[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={today} className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-colors">Today</button>
          <button onClick={prevMonth} className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={nextMonth} className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 min-w-[700px] border-b border-slate-700/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-700/50 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[minmax(120px,_1fr)] min-w-[700px]">
          {blanks.map(b => (
            <div key={`blank-${b}`} className="border-r border-b border-slate-700/30 bg-slate-900/30" />
          ))}
          {days.map(day => {
            const dayRes = getReservationsForDate(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            return (
              <div 
                key={day} 
                className={`border-r border-b border-slate-700/50 p-2 flex flex-col gap-1 hover:bg-slate-800/30 transition-colors cursor-pointer ${isToday ? 'bg-blue-500/5' : ''}`}
                onClick={() => onSelectDate(dateStr)}
              >
                <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-blue-500 text-white' : 'text-slate-400'}`}>
                  {day}
                </div>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {dayRes.map(res => (
                    <div 
                      key={res.id} 
                      onClick={(e) => { e.stopPropagation(); onSelectReservation(res); }}
                      className={`text-[10px] px-1.5 py-1 rounded border truncate hover:opacity-80 transition-opacity ${
                        res.status === 'seated' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' :
                        res.status === 'confirmed' ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' :
                        res.status === 'cancelled' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
                        'bg-amber-500/20 border-amber-500/30 text-amber-300'
                      }`}
                      title={`${res.reservationTime} - ${res.customerName} (T${res.tableNumber})`}
                    >
                      <span className="font-bold">{res.reservationTime}</span> {res.customerName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
