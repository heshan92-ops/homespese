import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Plus, Trash2, Search, Filter, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import MonthSelector from '../components/MonthSelector';

import { useFab } from '../context/FabContext';

const Movements = () => {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [movements, setMovements] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        type: 'EXPENSE',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        description: '',
        is_planned: false  // NEW: track if expense is planned/future
    });
    const [includePlanned, setIncludePlanned] = useState(true);  // NEW: filter state

    const fabContext = useFab();
    if (!fabContext) {
        return <div className="p-10 text-red-600 font-bold">ERROR: FabContext is missing!</div>;
    }
    const { setFabDate, lastUpdate } = fabContext;

    // Update FabDate when selected month changes
    useEffect(() => {
        const formattedDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
        setFabDate(formattedDate);
        return () => setFabDate(new Date().toISOString().split('T')[0]);
    }, [selectedMonth, selectedYear, setFabDate]);

    // Refetch when global update happens
    useEffect(() => {
        fetchMovements();
    }, [lastUpdate]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    const fetchMovements = async () => {
        try {
            const params = {
                month: selectedMonth,
                year: selectedYear,
                include_planned: includePlanned  // NEW: filter planned expenses
            };
            const res = await api.get('/movements', { params });
            setMovements(res.data);
        } catch (error) {
            console.error("Error fetching movements", error);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchMovements();
    }, [selectedMonth, selectedYear, includePlanned]);  // NEW: refetch when filter changes

    const handleMonthChange = (month, year) => {
        setSelectedMonth(month);
        setSelectedYear(year);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/movements/${editingId}`, formData);
                setEditingId(null);
            } else {
                await api.post('/movements', formData);
            }
            setShowForm(false);
            setFormData({
                type: 'EXPENSE',
                date: new Date().toISOString().split('T')[0],
                amount: '',
                category: '',
                description: '',
                is_planned: false  // NEW: reset planned status
            });
            fetchMovements();
            // triggerUpdate(); // Global update - commented out since useFab is disabled
        } catch (error) {
            console.error("Error saving movement", error);
        }
    };

    const handleEdit = (movement) => {
        setEditingId(movement.id);
        setFormData({
            type: movement.type,
            date: movement.date,
            amount: movement.amount,
            category: movement.category,
            description: movement.description || '',
            is_planned: movement.is_planned || false  // NEW: load planned status
        });
        setShowForm(true);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            type: 'EXPENSE',
            date: new Date().toISOString().split('T')[0],
            amount: '',
            category: '',
            description: '',
            is_planned: false  // NEW: reset planned status
        });
        setShowForm(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Sei sicuro di voler eliminare questo movimento?')) {
            try {
                await api.delete(`/movements/${id}`);
                fetchMovements();
                // triggerUpdate(); // Global update - commented out
            } catch (error) {
                console.error("Error deleting movement", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Month Selector */}
            <MonthSelector
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onChange={handleMonthChange}
                movementCount={movements?.length || 0}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Movimenti</h1>
                    <p className="text-slate-500 text-sm">Gestisci le tue entrate e uscite</p>
                </div>

                {/* NEW: Filter for Planned Expenses */}
                <label className="flex items-center space-x-2 cursor-pointer p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <input
                        type="checkbox"
                        checked={includePlanned}
                        onChange={e => setIncludePlanned(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Mostra spese previste</span>
                </label>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800">
                        {editingId ? 'Modifica Transazione' : 'Aggiungi Transazione'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ... form fields ... */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                            <div className="flex space-x-4 p-1 bg-slate-100 rounded-lg w-fit">
                                <label className={`flex items-center space-x-2 px-4 py-2 rounded-md cursor-pointer transition-all ${formData.type === 'EXPENSE' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="EXPENSE"
                                        checked={formData.type === 'EXPENSE'}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="hidden"
                                    />
                                    <span className="font-medium">Spesa</span>
                                </label>
                                <label className={`flex items-center space-x-2 px-4 py-2 rounded-md cursor-pointer transition-all ${formData.type === 'INCOME' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="INCOME"
                                        checked={formData.type === 'INCOME'}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="hidden"
                                    />
                                    <span className="font-medium">Entrata</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Data</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                            />
                        </div>

                        {/* NEW: Planned Expense Toggle */}
                        <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2 cursor-pointer p-3 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors w-full">
                                <input
                                    type="checkbox"
                                    checked={formData.is_planned}
                                    onChange={e => setFormData({ ...formData, is_planned: e.target.checked })}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                />
                                <div className="flex-1">
                                    <span className="text-sm font-medium text-blue-900">📅 Spesa Prevista</span>
                                    <p className="text-xs text-blue-700 mt-0.5">Questa spesa sarà effettuata in futuro</p>
                                </div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Importo (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                            <select
                                required
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                            >
                                <option value="">Seleziona...</option>
                                {categories && categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Descrizione</label>
                            <input
                                type="text"
                                placeholder="Es. Spesa settimanale..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-end space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium shadow-sm hover:shadow-md transition-all"
                            >
                                {editingId ? 'Aggiorna Movimento' : 'Salva Movimento'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrizione</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Importo</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {movements && movements.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                        {format(new Date(m.date), 'dd MMM yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${m.from_recurring_id && !m.is_confirmed
                                                ? 'bg-orange-100 text-orange-700 border border-orange-200'  // Unconfirmed recurring
                                                : m.from_recurring_id && m.is_confirmed
                                                    ? 'bg-green-100 text-green-700 border border-green-200'  // Confirmed recurring
                                                    : m.is_planned && !m.from_recurring_id
                                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'  // Manual planned
                                                        : m.type === 'INCOME'
                                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'  // Income
                                                            : 'bg-rose-100 text-rose-700 border border-rose-200'  // Regular expense
                                                }`}>
                                                {m.type === 'INCOME' ? 'Entrata' : 'Spesa'}
                                                {m.from_recurring_id && !m.is_confirmed && ' 🔁'}
                                                {m.from_recurring_id && m.is_confirmed && ' ✓'}
                                            </span>
                                            {/* Planned badge (only for non-recurring) */}
                                            {m.is_planned && !m.from_recurring_id && (
                                                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full border border-blue-200 font-medium">
                                                    📅 Prevista
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{m.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{m.description || '-'}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${m.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-700'
                                        }`}>
                                        {m.type === 'EXPENSE' && '- '}€ {m.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {/* NEW: Confirm button for unconfirmed recurring */}
                                            {m.from_recurring_id && !m.is_confirmed && (
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await api.post(`/recurring/movements/${m.id}/confirm`);
                                                            fetchMovements();
                                                        } catch (error) {
                                                            console.error("Error confirming movement", error);
                                                        }
                                                    }}
                                                    className="text-slate-400 hover:text-green-600 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Conferma spesa effettuata"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(m)}
                                                className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Modifica movimento"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(m.id)}
                                                className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Elimina movimento"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!movements || movements.length === 0) && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <Search size={32} className="mb-2 opacity-20" />
                                            <p>Nessun movimento trovato</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Movements;
