import React, { useState, useMemo } from 'react';
import { 
  useInventory, 
  useCreateInventoryItem, 
  useUpdateInventoryItem, 
  useDeleteInventoryItem 
} from '@/hooks/useInventory';
import { InventoryItem } from '@ristorante/shared';
import SearchInput from '@/components/common/SearchInput';
import EmptyState from '@/components/common/EmptyState';

const UNITS = ['Bottle', 'Keg', 'Piece', 'Liter', 'Kilogram'];

export default function InventoryPanel() {
  const { data: inventory = [], isLoading } = useInventory();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const deleteItem = useDeleteInventoryItem();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'Piece',
    quantity: 0,
    minStock: 0
  });

  const categories = useMemo(() => {
    const cats = new Set(inventory.map(item => item.category));
    return ['All', ...Array.from(cats)].sort();
  }, [inventory]);

  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                            item.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, search, selectedCategory]);

  const stats = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    inventory.forEach(item => {
      if (item.quantity === 0) outOfStock++;
      else if (item.quantity <= item.minStock) lowStock++;
      else inStock++;
    });

    return {
      total: inventory.length,
      inStock,
      lowStock,
      outOfStock
    };
  }, [inventory]);

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantity: item.quantity,
        minStock: item.minStock
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: '',
        unit: 'Piece',
        quantity: 0,
        minStock: 0
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
      updateItem.mutate({ id: editingItem.id, data: formData }, {
        onSuccess: handleCloseModal
      });
    } else {
      createItem.mutate(formData, {
        onSuccess: handleCloseModal
      });
    }
  };

  const handleDelete = (item: InventoryItem) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}? This cannot be undone.`)) {
      deleteItem.mutate(item.id);
    }
  };

  const adjustStock = (item: InventoryItem, amount: number) => {
    const newQty = Math.max(0, item.quantity + amount);
    updateItem.mutate({ id: item.id, data: { quantity: newQty } });
  };

  const getStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return { label: 'Out of Stock', color: 'bg-red-500/15 text-red-400 border-red-500/30' };
    if (item.quantity <= item.minStock) return { label: 'Low Stock', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    return { label: 'Stock OK', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
  };

  if (isLoading) return <div className="p-8 text-slate-400">Loading inventory...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200">
      
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📦</span> Inventory Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Track and manage restaurant stock</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <span>+</span> Add Item
        </button>
      </div>

      {/* Summary Cards */}
      <div className="p-6 grid grid-cols-4 gap-4 flex-shrink-0">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Items</div>
            <div className="text-2xl font-black text-white">{stats.total}</div>
          </div>
          <div className="text-3xl opacity-50">📦</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-500/70 uppercase tracking-wider mb-1">In Stock</div>
            <div className="text-2xl font-black text-emerald-400">{stats.inStock}</div>
          </div>
          <div className="text-3xl opacity-50">✅</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-500/70 uppercase tracking-wider mb-1">Low Stock</div>
            <div className="text-2xl font-black text-amber-400">{stats.lowStock}</div>
          </div>
          <div className="text-3xl opacity-50">⚠️</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-red-500/70 uppercase tracking-wider mb-1">Out of Stock</div>
            <div className="text-2xl font-black text-red-400">{stats.outOfStock}</div>
          </div>
          <div className="text-3xl opacity-50">❌</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 pb-4 flex gap-4 flex-shrink-0">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} accentColor="blue" placeholder="Search by name or category..." />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-48"
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        {filteredItems.length === 0 ? (
          <EmptyState icon="📦" message="No inventory items found." />
        ) : (
          <div className="border border-slate-700/50 rounded-2xl overflow-hidden bg-slate-900/50">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-bold">Item Name</th>
                  <th className="px-4 py-3 font-bold">Category</th>
                  <th className="px-4 py-3 font-bold text-center">Status</th>
                  <th className="px-4 py-3 font-bold text-right">Min Stock</th>
                  <th className="px-4 py-3 font-bold text-right">Quantity</th>
                  <th className="px-4 py-3 font-bold text-center">Unit</th>
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredItems.map(item => {
                  const statusInfo = getStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                        {item.quantity <= item.minStock && <span title="Low Stock Warning">⚠️</span>}
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs font-semibold">{item.category}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400">{item.minStock}</td>
                      <td className="px-4 py-3 text-right font-bold text-white">
                        <div className="flex justify-end items-center gap-2">
                          <button onClick={() => adjustStock(item, -1)} className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">-</button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button onClick={() => adjustStock(item, 1)} className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">+</button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-500 text-xs">{item.unit}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => handleOpenModal(item)} className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase">Edit</button>
                        <button onClick={() => handleDelete(item)} className="text-red-400 hover:text-red-300 text-xs font-bold uppercase">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">{editingItem ? 'Edit Item' : 'Add Item'}</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Coca-Cola"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. SOFT DRINKS"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    {/* Allow custom units by just letting them type if needed, but select is fine for now based on requirements */}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Minimum Stock</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.minStock}
                    onChange={e => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm font-bold hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createItem.isPending || updateItem.isPending}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-colors"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
