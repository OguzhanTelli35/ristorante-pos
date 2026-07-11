export type TableStatus = 'available' | 'reserved' | 'occupied' | 'waiting_payment' | 'cleaning';

export const getTableStatusColor = (status: TableStatus): { bg: string, border: string, text: string, shadow: string } => {
  switch (status) {
    case 'available':
      return {
        bg: 'bg-emerald-900/40',
        border: 'border-emerald-500',
        text: 'text-emerald-400',
        shadow: 'shadow-emerald-500/20'
      };
    case 'reserved':
      return {
        bg: 'bg-blue-900/40',
        border: 'border-blue-500',
        text: 'text-blue-400',
        shadow: 'shadow-blue-500/20'
      };
    case 'occupied':
      return {
        bg: 'bg-orange-900/40',
        border: 'border-orange-500',
        text: 'text-orange-400',
        shadow: 'shadow-orange-500/20'
      };
    case 'waiting_payment':
      return {
        bg: 'bg-red-900/40',
        border: 'border-red-500',
        text: 'text-red-400',
        shadow: 'shadow-red-500/20'
      };
    case 'cleaning':
      return {
        bg: 'bg-slate-800',
        border: 'border-slate-500',
        text: 'text-slate-400',
        shadow: 'shadow-slate-500/20'
      };
    default:
      return {
        bg: 'bg-slate-800',
        border: 'border-slate-600',
        text: 'text-slate-400',
        shadow: 'shadow-slate-500/0'
      };
  }
};

export const getTableStatusLabel = (status: TableStatus): string => {
  switch (status) {
    case 'available': return 'Available';
    case 'reserved': return 'Reserved';
    case 'occupied': return 'Occupied';
    case 'waiting_payment': return 'Waiting Payment';
    case 'cleaning': return 'Cleaning';
    default: return 'Unknown';
  }
};
