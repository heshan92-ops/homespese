import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Plus, Target, Edit2, Trash2, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        target_amount: '',
        current_amount: '0',
        deadline: '',
        color: '#10b981'
    });

    const fetchGoals = async () => {
        try {
            const res = await api.get('/goals');
            setGoals(res.data);
        } catch (error) {
            console.error("Error fetching goals", error);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                target_amount: parseFloat(formData.target_amount),
                current_amount: parseFloat(formData.current_amount || 0),
                deadline: formData.deadline || null
            };

            if (editingGoal) {
                await api.put(`/goals/${editingGoal.id}`, payload);
            } else {
                await api.post('/goals', payload);
            }

            setShowForm(false);
            setEditingGoal(null);
            setFormData({
                name: '',
                target_amount: '',
                current_amount: '0',
                deadline: '',
                color: '#10b981'
            });
            fetchGoals();
        } catch (error) {
            console.error("Error saving goal", error);
        }
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setFormData({
            name: goal.name,
            target_amount: goal.target_amount,
            current_amount: goal.current_amount,
            deadline: goal.deadline || '',
            color: goal.color || '#10b981'
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Sei sicuro di voler eliminare questo obiettivo?')) {
            try {
                await api.delete(`/goals/${id}`);
                fetchGoals();
            } catch (error) {
                console.error("Error deleting goal", error);
            }
        }
    };

    const calculateProgress = (current, target) => {
        return Math.min((current / target) * 100, 100);
    };

    const calculateMonthlySavings = (goal) => {
        if (!goal.deadline) return null;
        const today = new Date();
        const deadline = new Date(goal.deadline);

        // Calculate months difference
        const months = (deadline.getFullYear() - today.getFullYear()) * 12 + (deadline.getMonth() - today.getMonth());

        if (months <= 0) return null;

        const remaining = goal.target_amount - goal.current_amount;
        if (remaining <= 0) return 0;

        return remaining / months;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Obiettivi di Risparmio</h1>
                    <p className="text-slate-500 text-sm">Pianifica i tuoi acquisti futuri</p>
                </div>
                <button
                    onClick={() => {
                        setEditingGoal(null);
                        setFormData({ name: '', target_amount: '', current_amount: '0', deadline: '', color: '#10b981' });
                        setShowForm(!showForm);
                    }}
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-emerald-700 transition-all shadow-sm hover:shadow-emerald-200 hover:shadow-md"
                >
                    <Plus size={20} />
                    <span>Nuovo Obiettivo</span>
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800">{editingGoal ? 'Modifica Obiettivo' : 'Nuovo Obiettivo'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nome</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                                    placeholder="Es. Vacanza Estiva"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Colore</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        className="h-[46px] w-[60px] rounded-xl border-slate-200 shadow-sm cursor-pointer"
                                    />
                                    <span className="text-sm text-slate-500">{formData.color}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Obiettivo (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.target_amount}
                                    onChange={e => setFormData({ ...formData, target_amount: e.target.value })}
                                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                                    placeholder="2000.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Già Risparmiato (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.current_amount}
                                    onChange={e => setFormData({ ...formData, current_amount: e.target.value })}
                                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Scadenza (Opzionale)</label>
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium shadow-sm hover:shadow-md transition-all"
                            >
                                Salva
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => {
                    const progress = calculateProgress(goal.current_amount, goal.target_amount);
                    const monthlySavings = calculateMonthlySavings(goal);
                    const isCompleted = goal.current_amount >= goal.target_amount;

                    return (
                        <div key={goal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group relative overflow-hidden">
                            {/* Color Stripe */}
                            <div
                                className="absolute top-0 left-0 w-1.5 h-full"
                                style={{ backgroundColor: goal.color }}
                            />

                            <div className="pl-2">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                            {goal.name}
                                            {isCompleted && <CheckCircle size={18} className="text-emerald-500" />}
                                        </h3>
                                        {goal.deadline && (
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <Calendar size={12} />
                                                Scadenza: {new Date(goal.deadline).toLocaleDateString('it-IT')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(goal)}
                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(goal.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-600">Progresso</span>
                                        <span className="font-bold text-slate-800">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${progress}%`,
                                                backgroundColor: goal.color
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Risparmiati</p>
                                        <p className="text-xl font-bold text-slate-800">€ {goal.current_amount.toLocaleString('it-IT')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 mb-1">Obiettivo</p>
                                        <p className="text-lg font-semibold text-slate-600">€ {goal.target_amount.toLocaleString('it-IT')}</p>
                                    </div>
                                </div>

                                {monthlySavings !== null && !isCompleted && (
                                    <div className="mt-4 pt-4 border-t border-slate-50">
                                        <p className="text-xs text-slate-500">
                                            Risparmia <span className="font-bold text-slate-800">€ {monthlySavings.toFixed(2)}</span> al mese per raggiungere l'obiettivo
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Goals;
