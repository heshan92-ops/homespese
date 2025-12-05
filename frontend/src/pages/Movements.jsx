import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/client';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, Calendar, Repeat, Filter, X } from 'lucide-react';
import { useFab } from '../context/FabContext';

const Movements = () => {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [movements, setMovements] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showMovementModal, setShowMovementModal] = useState(false);
    const [showRecurringModal, setShowRecurringModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        type: 'EXPENSE',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        description: '',
        is_planned: false
    });
    const [recurringFormData, setRecurringFormData] = useState({
        name: '',
        amount: '',
        category: '',
        description: '',
        recurrence_type: 'monthly',
        day_of_month: 1,
        start_date: new Date().toISOString().split('T')[0],
        end_date: null
    });

    // Filters
    const [filterCategory, setFilterCategory] = useState('');
    const [filterType, setFilterType] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const fabContext = useFab();
    if (!fabContext) {
        return <div className="p-10 text-red-600 font-bold">ERROR: FabContext is missing!</div>;
    }
    const { setFabDate, lastUpdate } = fabContext;

    useEffect(() => {
        const formattedDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
        setFabDate(formattedDate);
        return () => setFabDate(new Date().toISOString().split('T')[0]);
    }, [selectedMonth, selectedYear, setFabDate]);

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
                category: filterCategory || undefined,
                type: filterType || undefined
            };
            const res = await api.get('/movements', { params });
            setMovements(res.data);
        } catch (error) {
            console.error("Error fetching movements", error);
        }
    };

    // Group movements by date
    const groupedMovements = useMemo(() => {
        const groups = {};
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        movements.forEach(m => {
            let dateLabel = m.date;
            if (m.date === today) dateLabel = 'Oggi';
            else if (m.date === yesterday) dateLabel = 'Ieri';
            else {
                const d = new Date(m.date);
                dateLabel = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
                // Capitalize first letter
                dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
            }

            if (!groups[dateLabel]) groups[dateLabel] = [];
            groups[dateLabel].push(m);
        });
        return groups;
    }, [movements]);

    useEffect(() => {
        fetchCategories();
        fetchMovements();
    }, [selectedMonth, selectedYear, filterCategory, filterType]);

    const handleMonthChange = (month, year) => {
        setSelectedMonth(month);
        setSelectedYear(year);
    };

    const handleMovementSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount)
            };
            if (editingId) {
                await api.put(`/movements/${editingId}`, payload);
                setEditingId(null);
            } else {
                await api.post('/movements', payload);
            }
            setShowMovementModal(false);
            setFormData({
                type: 'EXPENSE',
                date: new Date().toISOString().split('T')[0],
                amount: '',
                category: '',
                description: '',
                is_planned: false
            });
            fetchMovements();
        } catch (error) {
            console.error("Error saving movement", error);
            alert('Errore durante il salvataggio. Controlla i dati inseriti.');
        }
    };

    const handleRecurringSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...recurringFormData,
                amount: parseFloat(recurringFormData.amount)
            };
            await api.post('/recurring', payload);
            setShowRecurringModal(false);
            setRecurringFormData({
                name: '',
                amount: '',
                category: '',
                description: '',
                recurrence_type: 'monthly',
                day_of_month: 1,
                start_date: new Date().toISOString().split('T')[0],
                end_date: null
            });
            fetchMovements();
        } catch (error) {
            console.error("Error saving recurring expense", error);
            alert('Errore durante il salvataggio. Controlla i dati inseriti.');
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
            is_planned: movement.is_planned || false
        });
        setShowMovementModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Eliminare questo movimento?')) {
            try {
                await api.delete(`/movements/${id}`);
                fetchMovements();
            } catch (error) {
                console.error("Error deleting movement", error);
            }
        }
    };

    const monthsShort = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT SIDEBAR - Calendar & Actions */}
            <div className="w-full lg:w-1/3 space-y-4">
                {/* Mini Calendar */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => {
                                const newMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
                                const newYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
                                handleMonthChange(newMonth, newYear);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            ←
                        </button>
                        <h3 className="font-bold text-slate-800">
                            {monthsShort[selectedMonth - 1]} {selectedYear}
                        </h3>
                        <button
                            onClick={() => {
                                const newMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
                                const newYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
                                handleMonthChange(newMonth, newYear);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            →
                        </button>
                    </div>

                    {/* Days of week */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, i) => (
                            <div key={i} className="text-center text-xs font-medium text-slate-500 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                        {(() => {
                            const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
                            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
                            const startDay = firstDay === 0 ? 6 : firstDay - 1;
                            const days = [];

                            // Empty cells before month starts
                            for (let i = 0; i < startDay; i++) {
                                days.push(<div key={`empty-${i}`} className="aspect-square" />);
                            }

                            // Days of the month
                            const todayDate = new Date();
                            const isCurrentMonth = selectedMonth === todayDate.getMonth() + 1 && selectedYear === todayDate.getFullYear();

                            for (let day = 1; day <= daysInMonth; day++) {
                                const isToday = isCurrentMonth && day === todayDate.getDate();
                                days.push(
                                    <div
                                        key={day}
                                        className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${isToday
                                            ? 'bg-emerald-600 text-white font-bold'
                                            : 'text-slate-700 hover:bg-slate-100'
                                            }`}
                                    >
                                        {day}
                                    </div>
                                );
                            }

                            return days;
                        })()}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                type: 'EXPENSE',
                                date: new Date().toISOString().split('T')[0],
                                amount: '',
                                category: '',
                                description: '',
                                is_planned: false
                            });
                            setShowMovementModal(true);
                        }}
                        className="w-full bg-emerald-600 text-white px-5 py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus size={20} />
                        <span className="font-semibold">Aggiungi Movimento</span>
                    </button>
                    <button
                        onClick={() => setShowRecurringModal(true)}
                        className="w-full bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                        <Repeat size={20} />
                        <span className="font-semibold">Aggiungi Spesa Ricorrente</span>
                    </button>
                </div>
            </div>

            {/* RIGHT CONTENT - Movements List */}
            <div className="flex-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Movimenti</h2>
                            <p className="text-sm text-slate-500 mt-1">{movements.length} transazioni</p>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${showFilters ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Filter size={18} />
                            <span className="text-sm font-medium hidden sm:inline">Filtri</span>
                        </button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Categoria</label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full rounded-lg border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                >
                                    <option value="">Tutte le categorie</option>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Tipo</label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full rounded-lg border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                >
                                    <option value="">Tutti i tipi</option>
                                    <option value="INCOME">Entrate</option>
                                    <option value="EXPENSE">Spese</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                        {Object.keys(groupedMovements).length > 0 ? (
                            Object.entries(groupedMovements).map(([dateLabel, groupMovements]) => (
                                <div key={dateLabel}>
                                    <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm px-4 py-2 border-y border-slate-100 z-10 shadow-sm">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{dateLabel}</h3>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {groupMovements.map((m) => (
                                            <div key={m.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <div className={`p-2 rounded-full ${m.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                        {m.type === 'INCOME' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-800">{m.category}</p>
                                                        {m.description && (
                                                            <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                                                                {m.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-right">
                                                        <p className={`font-bold ${m.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-700'}`}>
                                                            {m.type === 'EXPENSE' && '-'}€ {m.amount.toFixed(2)}
                                                        </p>
                                                        {m.is_planned && (
                                                            <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                                                                Prevista
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(m)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(m.id)}
                                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-slate-400">
                                <div className="mb-3 flex justify-center">
                                    <Filter size={48} className="text-slate-200" />
                                </div>
                                <p>Nessun movimento trovato</p>
                                {(filterCategory || filterType) && (
                                    <p className="text-sm mt-1">Prova a modificare i filtri</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Movement Modal */}
            {showMovementModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">
                            {editingId ? 'Modifica Movimento' : 'Nuovo Movimento'}
                        </h3>
                        <form onSubmit={handleMovementSubmit} className="space-y-4">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                                    className={`flex-1 py-2 rounded-lg font-medium transition-all ${formData.type === 'EXPENSE' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}
                                >
                                    Spesa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                                    className={`flex-1 py-2 rounded-lg font-medium transition-all ${formData.type === 'INCOME' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}
                                >
                                    Entrata
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Importo</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">Seleziona...</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Data</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Descrizione (opzionale)</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Note..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowMovementModal(false)}
                                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm hover:shadow-md transition-all"
                                >
                                    Salva
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Recurring Expense Modal */}
            {showRecurringModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Nuova Spesa Ricorrente</h3>
                        <form onSubmit={handleRecurringSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nome</label>
                                <input
                                    type="text"
                                    required
                                    value={recurringFormData.name}
                                    onChange={(e) => setRecurringFormData({ ...recurringFormData, name: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                    placeholder="es. Rata Macchina"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Importo</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={recurringFormData.amount}
                                    onChange={(e) => setRecurringFormData({ ...recurringFormData, amount: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                                <select
                                    required
                                    value={recurringFormData.category}
                                    onChange={(e) => setRecurringFormData({ ...recurringFormData, category: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">Seleziona...</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Giorno del Mese</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    required
                                    value={recurringFormData.day_of_month}
                                    onChange={(e) => setRecurringFormData({ ...recurringFormData, day_of_month: parseInt(e.target.value) || 1 })}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">Es: 5 = ogni 5 del mese</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Data Inizio</label>
                                <input
                                    type="date"
                                    required
                                    value={recurringFormData.start_date}
                                    onChange={(e) => setRecurringFormData({ ...recurringFormData, start_date: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Data Fine (opzionale)</label>
                                <input
                                    type="date"
                                    value={recurringFormData.end_date || ''}
                                    onChange={(e) => setRecurringFormData({ ...recurringFormData, end_date: e.target.value || null })}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">Lascia vuoto per ricorrenza indefinita</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Descrizione (opzionale)</label>
                                <input
                                    type="text"
                                    value={recurringFormData.description}
                                    onChange={(e) => setRecurringFormData({ ...recurringFormData, description: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Note..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRecurringModal(false)}
                                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm hover:shadow-md transition-all"
                                >
                                    Salva
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Movements;
