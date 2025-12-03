import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../api/client';
import { useFab } from '../context/FabContext';

const GlobalFab = () => {
    const { fabDate, triggerUpdate } = useFab();
    const [showModal, setShowModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        type: 'EXPENSE',
        date: fabDate,
        amount: '',
        category: '',
        description: ''
    });

    // Reset date when fabDate changes (e.g. navigation)
    useEffect(() => {
        setFormData(prev => ({ ...prev, date: fabDate }));
    }, [fabDate]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    // Fetch categories when modal opens
    useEffect(() => {
        if (showModal) {
            fetchCategories();
            // Ensure date is fresh from context when opening
            setFormData(prev => ({ ...prev, date: fabDate }));
        }
    }, [showModal, fabDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/movements', formData);
            setShowModal(false);
            setFormData({
                type: 'EXPENSE',
                date: fabDate, // Reset to current context date
                amount: '',
                category: '',
                description: ''
            });
            triggerUpdate(); // Notify other components to refresh
        } catch (error) {
            console.error("Error adding movement", error);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-8 right-8 bg-emerald-600 text-white p-5 rounded-full shadow-2xl hover:bg-emerald-700 hover:scale-110 transition-all duration-300 hover:shadow-emerald-200 z-[60] group"
                title="Nuovo Movimento"
            >
                <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Nuovo Movimento</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            <button
                                type="submit"
                                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
                            >
                                Aggiungi Movimento
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default GlobalFab;
