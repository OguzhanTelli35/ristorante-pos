import React, { useState } from 'react';
import { useTables } from '@/hooks/useTables';
import TableDetailsModal from './TableDetailsModal';
import { getTableStatusColor, getTableStatusLabel, TableStatus } from '@/utils/tableStatus';

interface RestaurantMapProps {
  onOrderEntry?: (tableNumber: number) => void;
}

const OUTDOOR_TABLES = [
  { id: 'T1', num: 1, cap: 2 },
  { id: 'T2', num: 2, cap: 4 },
  { id: 'T3', num: 3, cap: 2 },
  { id: 'T4', num: 4, cap: 4 },
  { id: 'T5', num: 5, cap: 4 },
  { id: 'T6', num: 6, cap: 2 },
];

const INDOOR_TABLES = [
  { id: 'T7', num: 7, cap: 4 },
  { id: 'T8', num: 8, cap: 2 },
  { id: 'T9', num: 9, cap: 4 },
  { id: 'T10', num: 10, cap: 2 },
  { id: 'T11', num: 11, cap: 4 },
  { id: 'T12', num: 12, cap: 2 },
  { id: 'T13', num: 13, cap: 4 },
  { id: 'T14', num: 14, cap: 2 },
  { id: 'T15', num: 15, cap: 4 },
  { id: 'T16', num: 16, cap: 2 },
  { id: 'T17', num: 17, cap: 4 },
  { id: 'T18', num: 18, cap: 2 },
  { id: 'T19', num: 19, cap: 4 },
  { id: 'T20', num: 20, cap: 2 },
];

const ALL_TABLES = [...OUTDOOR_TABLES, ...INDOOR_TABLES];

export default function RestaurantMap({ onOrderEntry }: RestaurantMapProps) {
  const { data: activeTables = [] } = useTables();
  const [selectedTableNum, setSelectedTableNum] = useState<number | null>(null);

  const getTableColorClass = (tableNumber: number) => {
    const account = activeTables.find(t => t.tableNumber === tableNumber);
    const status = (account?.status || 'available') as TableStatus;
    const colors = getTableStatusColor(status);
    return `${colors.bg} ${colors.border} hover:opacity-80 ${colors.shadow}`;
  };

  const getTableStatusText = (tableNumber: number) => {
    const account = activeTables.find(t => t.tableNumber === tableNumber);
    const status = (account?.status || 'available') as TableStatus;
    if (status === 'available') return 'Available';
    return account?.guestCount ? `${account.guestCount} Guests` : getTableStatusLabel(status);
  };

  const selectedTableData = ALL_TABLES.find(t => t.num === selectedTableNum);
  const selectedAccount = selectedTableNum 
    ? activeTables.find(t => t.tableNumber === selectedTableNum)
    : undefined;

  const renderTable = (table: { id: string; num: number; cap: number }) => {
    const colors = getTableColorClass(table.num);
    const status = getTableStatusText(table.num);
    
    if (table.cap === 2) {
      return (
        <button
          key={table.id}
          onClick={() => setSelectedTableNum(table.num)}
          className={`group relative flex flex-col items-center justify-center w-full aspect-square rounded-full border-2 transition-all shadow-lg ${colors}`}
        >
          <span className="text-sm font-bold text-white">{table.id}</span>
          <span className="text-[9px] text-slate-300 font-semibold mt-0.5">{status}</span>
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-l-md bg-slate-600/70 group-hover:bg-slate-500"></div>
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-md bg-slate-600/70 group-hover:bg-slate-500"></div>
        </button>
      );
    } else {
      return (
        <button
          key={table.id}
          onClick={() => setSelectedTableNum(table.num)}
          className={`group relative flex flex-col items-center justify-center w-full aspect-[4/3] rounded-xl border-2 transition-all shadow-lg ${colors}`}
        >
          <span className="text-sm font-bold text-white">{table.id}</span>
          <span className="text-[9px] text-slate-300 font-semibold mt-0.5">{status}</span>
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-l-md bg-slate-600/70 group-hover:bg-slate-500"></div>
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-md bg-slate-600/70 group-hover:bg-slate-500"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 h-1.5 w-8 rounded-t-md bg-slate-600/70 group-hover:bg-slate-500"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 h-1.5 w-8 rounded-b-md bg-slate-600/70 group-hover:bg-slate-500"></div>
        </button>
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 p-6 overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Restaurant Map</h2>
          <p className="text-xs text-slate-400 mt-1">Select a table to manage orders</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Available</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Reserved</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> Occupied</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Waiting Payment</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div> Cleaning</div>
        </div>
      </div>

      <div className="bg-slate-950/80 rounded-2xl border border-slate-700/50 p-8 flex-1 min-h-[500px] relative shadow-inner flex flex-col gap-10">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        {/* OUTDOOR AREA */}
        <div className="relative z-10 border-2 border-slate-700/50 rounded-2xl p-6 bg-slate-900/30">
          <div className="absolute -top-3 left-6 px-3 bg-slate-950/80 text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
            <span>🌿 Outdoor Terrace</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-12 mt-4">
            {OUTDOOR_TABLES.map(renderTable)}
          </div>
          
          <div className="mt-8 pt-4 border-t border-dashed border-slate-700/50 flex justify-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/50 px-8 py-2 rounded-full border border-slate-700/50">
              Walkway to Entrance
            </div>
          </div>
        </div>

        {/* INDOOR AREA */}
        <div className="relative z-10 border-2 border-slate-700/50 rounded-2xl p-6 bg-slate-900/30 flex-1">
          <div className="absolute -top-3 left-6 px-3 bg-slate-950/80 text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <span>🏠 Main Dining Room</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
            
            {/* Left Wing */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
              {INDOOR_TABLES.slice(0, 10).map(renderTable)}
            </div>

            {/* Right Wing / Features */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              
              <div className="bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700/50 h-24 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#475569_10px,#475569_20px)]"></div>
                <span className="relative z-10 font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span>🍹 Bar Area</span>
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-12">
                {INDOOR_TABLES.slice(10, 14).map(renderTable)}
              </div>

              <div className="bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700/50 h-24 flex items-center justify-center relative overflow-hidden mt-auto">
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,#475569_10px,#475569_20px)]"></div>
                <span className="relative z-10 font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span>🔥 Kitchen Pass</span>
                </span>
              </div>

            </div>
          </div>
          
        </div>

      </div>

      {selectedTableNum && selectedTableData && (
        <TableDetailsModal
          tableNumber={selectedTableNum}
          capacity={selectedTableData.cap}
          account={selectedAccount}
          onClose={() => setSelectedTableNum(null)}
          onOrderEntry={(num) => {
            setSelectedTableNum(null);
            onOrderEntry?.(num);
          }}
        />
      )}
    </div>
  );
}
