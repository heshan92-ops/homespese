import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';

const RecurringExpenses = () => {
    const [recurringExpenses, setRecurringExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingRecurring, setEditingRecurring] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category: '',
        description: '',
        recurrence_type: 'monthly',
        day_of_month: 1,
        start_date: new Date().toISOString().split('T')[0],
        end_date: null
    });

    const fetchData = async () => {
        try {
            const [recurringRes, categoriesRes] = await Promise.all([
                api.get('/recurring'),
                api.get('/categories')
            ]);
            setRecurringExpenses(recurringRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (recurring) => {
        setEditingRecurring(recurring);
        setFormData({
            name: recurring.name,
            amount: recurring.amount,
            category: recurring.category,
            description: recurring.description || '',
            recurrence_type: recurring.recurrence_type || 'monthly',
            day_of_month: recurring.day_of_month || 1,
            start_date: recurring.start_date || new Date().toISOString().split('T')[0],
            end_date: recurring.end_date || null
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingRecurring && editingRecurring.id) {
                await api.put(`/recurring/${editingRecurring.id}`, formData);
            } else {
                await api.post('/recurring', formData);
            }
            setEditingRecurring(null);
            resetForm();
            fetchData();
        } catch (error) {
            console.error("Error saving recurring expense", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Eliminare questa spesa ricorrente? Le spese confermate rimarranno, quelle non confermate saranno eliminate.')) {
            try {
                await api.delete(`/recurring/${id}`);
                fetchData();
            } catch (error) {
                console.error("Error deleting recurring expense", error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            amount: '',
            category: categories[0]?.name || '',
            description: '',
            recurrence_type: 'monthly',
            day_of_month: 1,
            start_date: new Date().toISOString().split('T')[0],
            end_date: null
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Spese Ricorrenti</h1>
                    <p className="text-slate-500 text-sm">Gestisci le spese che si ripetono ogni mese</p>
                </div>
                <button
                    onClick={() => { setEditingRecurring({}); resetForm(); }}
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-emerald-700 transition-all shadow-sm hover:shadow-emerald-200 hover:shadow-md"
                >
                    <Plus size={20} />
                    <span>Nuova Spesa Ricorrente</span>
                </button>
            </div>

            {/* Form */}
            {editingRecurring && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800">
                        {editingRecurring.id ? 'Modifica Spesa Ricorrente' : 'Nuova Spesa Ricorrente'}
                    </h2>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nome</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="es. Rata Macchina"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                                />
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
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Giorno del Mese</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    required
                                    value={formData.day_of_month}
                                    onChange={e => setFormData({ ...formData, day_of_month: parseInt(e.target.value) || 1 })}
                                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                                />
                                <p className="text-xs text-slate-500 mt-1">Es: 5 = ogni 5 del mese</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Data Inizio</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Data Fine (opzionale)</label>
                                <input
                                    type="date"
                                    value={formData.end_date || ''}
                                    onChange={e => setFormData({ ...formData, end_date: e.target.value || null })}
                                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                                />
                                <p className="text-xs text-slate-500 mt-1">Lascia vuoto per ricorrenza indefinita</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Descrizione</label>
                            <input
                                type="text"
                                placeholder="Descrizione opzionale..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditingRecurring(null)}
                                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium shadow-sm hover:shadow-md transition-all"
                            >
                                Salva
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recurringExpenses.map(recurring => (
                    <div key={recurring.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 text-lg">{recurring.name}</h3>
                                <p className="text-sm text-slate-500 mt-1">{recurring.category}</p>
                                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                    <Calendar size={12} />
                                    Giorno {recurring.day_of_month} del mese
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(recurring)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Modifica"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(recurring.id)}
                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Elimina"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                            <span className="text-2xl font-bold text-emerald-600">€ {parseFloat(recurring.amount).toFixed(2)}</span>
                            <span className="text-xs text-slate-500">al mese</span>
                        </div>

                        {recurring.description && (
                            <p className="text-sm text-slate-600 mt-3 italic">"{recurring.description}"</p>
                        )}
                    </div>
                ))}

                {/* Add new card */}
                {!editingRecurring && (
                    <button
                        onClick={() => { setEditingRecurring({}); resetForm(); }}
                        className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 min-h-[200px]"
                    >
                        <div className="p-3 bg-slate-50 rounded-full mb-3 group-hover:bg-emerald-100 transition-colors">
                            <Plus size={24} />
                        </div>
                        <span className="font-medium">Nuova Spesa Ricorrente</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default RecurringExpenses;
