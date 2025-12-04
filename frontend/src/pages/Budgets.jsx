import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Plus, Edit2, AlertCircle, Trash2, X, ArrowRight, List, Wallet, PiggyBank, Calculator } from 'lucide-react';
import CategoryMovementsModal from '../components/CategoryMovementsModal';

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [summary, setSummary] = useState({ income: 0 }); // NEW: for income data
    const [editingBudget, setEditingBudget] = useState(null);
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        applicable_months: null  // NEW: null = all months, or [1,2,3...12]
    });
    const [allMonths, setAllMonths] = useState(true);  // NEW: toggle for all months

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ open: false, budget: null, expenses: [] });
    const [reassignCategory, setReassignCategory] = useState('');

    // Movements Modal State
    const [movementsModal, setMovementsModal] = useState({ open: false, category: null });

    const fetchData = async () => {
        try {
            const [budgetsRes, chartRes, categoriesRes, summaryRes] = await Promise.all([
                api.get('/budgets'),
                api.get('/dashboard/chart-data'),
                api.get('/categories'),
                api.get('/dashboard/summary') // Fetch summary for income
            ]);
            setBudgets(budgetsRes.data);
            setExpenses(chartRes.data.expenses_by_category);
            setCategories(categoriesRes.data);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (budget) => {
        setEditingBudget(budget);
        // Parse applicable_months from JSON string
        let months = null;
        let applyToAll = true;
        if (budget.applicable_months) {
            try {
                months = JSON.parse(budget.applicable_months);
                applyToAll = false;
            } catch (e) {
                console.error("Error parsing applicable_months", e);
            }
        }
        setFormData({
            category: budget.category,
            amount: budget.amount,
            applicable_months: months
        });
        setAllMonths(applyToAll);
    };

    const handleDeleteClick = async (budget) => {
        try {
            const res = await api.get(`/budgets/${budget.id}/expenses`);
            const budgetExpenses = res.data;

            if (budgetExpenses.length > 0) {
                setDeleteModal({ open: true, budget, expenses: budgetExpenses });
                setReassignCategory(''); // Reset selection
            } else {
                // No expenses, delete directly
                if (window.confirm(`Sei sicuro di voler eliminare il budget per ${budget.category}?`)) {
                    await api.delete(`/budgets/${budget.id}`);
                    fetchData();
                }
            }
        } catch (error) {
            console.error("Error checking expenses", error);
            // Fallback if check fails
            if (window.confirm(`Sei sicuro di voler eliminare il budget per ${budget.category}?`)) {
                await api.delete(`/budgets/${budget.id}`);
                fetchData();
            }
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.budget) return;

        try {
            if (reassignCategory) {
                // Reassign and delete
                await api.post(`/budgets/reassign-and-delete/${deleteModal.budget.id}`, null, {
                    params: { new_category: reassignCategory }
                });
            } else {
                // Just delete
                await api.delete(`/budgets/${deleteModal.budget.id}`);
            }
            setDeleteModal({ open: false, budget: null, expenses: [] });
            fetchData();
        } catch (error) {
            console.error("Error deleting budget", error);
            alert("Errore durante l'eliminazione");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/budgets', formData);
            setEditingBudget(null);
            setFormData({ category: '', amount: '', applicable_months: null });
            setAllMonths(true);  // Reset to all months
            fetchData();
        } catch (error) {
            console.error("Error saving budget", error);
        }
    };

    const getProgress = (category, limit) => {
        const expense = expenses.find(e => e.category === category)?.amount || 0;
        const percentage = Math.min((expense / limit) * 100, 100);
        return { expense, percentage };
    };

    // Calculate Totals
    const totalBudget = budgets.reduce((acc, curr) => acc + curr.amount, 0);
    const totalIncome = summary.income || 0;
    const difference = totalIncome - totalBudget;

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Budget Mensili</h1>
                    <p className="text-slate-500 text-sm">Imposta i limiti di spesa per categoria</p>
                </div>
                <button
                    onClick={() => {
                        setEditingBudget({});
                        setFormData({ category: categories[0]?.name || '', amount: '', applicable_months: null });
                        setAllMonths(true);
                    }}
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-emerald-700 transition-all shadow-sm hover:shadow-emerald-200 hover:shadow-md"
                >
                    <Plus size={20} />
                    <span>Nuovo Budget</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Totale Budget */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Budget Allocato</p>
                        <h3 className="text-2xl font-bold text-slate-800">€ {totalBudget.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>

                {/* Totale Entrate */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <PiggyBank size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Entrate Mensili</p>
                        <h3 className="text-2xl font-bold text-slate-800">€ {totalIncome.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>

                {/* Differenza */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${difference >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                        <Calculator size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Disponibile</p>
                        <h3 className={`text-2xl font-bold ${difference >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                            {difference >= 0 ? '+' : ''}€ {difference.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Edit/Create Form */}
            {editingBudget && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800">{editingBudget.id ? 'Modifica Budget' : 'Nuovo Budget'}</h2>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                                    disabled={!!editingBudget.id}
                                >
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Limite Mensile (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                                />
                            </div>
                        </div>

                        {/* NEW: Month Selection */}
                        <div className="border-t border-slate-200 pt-4">
                            <label className="flex items-center space-x-2 cursor-pointer mb-3">
                                <input
                                    type="checkbox"
                                    checked={allMonths}
                                    onChange={e => {
                                        setAllMonths(e.target.checked);
                                        setFormData({ ...formData, applicable_months: e.target.checked ? null : [] });
                                    }}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium text-slate-700">Applica a tutti i mesi</span>
                            </label>

                            {!allMonths && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <p className="text-xs font-medium text-slate-600 mb-3">Seleziona i mesi in cui applicare questo budget:</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'].map((month, idx) => (
                                            <label
                                                key={idx}
                                                className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all ${formData.applicable_months?.includes(idx + 1)
                                                    ? 'bg-emerald-50 border-emerald-300'
                                                    : 'bg-white border-slate-200 hover:border-emerald-200'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.applicable_months?.includes(idx + 1) || false}
                                                    onChange={e => {
                                                        const months = formData.applicable_months || [];
                                                        if (e.target.checked) {
                                                            setFormData({ ...formData, applicable_months: [...months, idx + 1].sort((a, b) => a - b) });
                                                        } else {
                                                            setFormData({ ...formData, applicable_months: months.filter(m => m !== idx + 1) });
                                                        }
                                                    }}
                                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <span className="text-sm font-medium text-slate-700">{month}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditingBudget(null)}
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

            {/* Budget List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map(budget => {
                    const { expense, percentage } = getProgress(budget.category, budget.amount);
                    const isOver = expense > budget.amount;
                    const isWarning = !isOver && percentage > 80;

                    return (
                        <div key={budget.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200 group cursor-pointer"
                            onClick={() => setMovementsModal({ open: true, category: budget.category })}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-800 text-lg">{budget.category}</h3>
                                        <List size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    {/* NEW: Show applicable months if specified */}
                                    {budget.applicable_months && (() => {
                                        try {
                                            const months = JSON.parse(budget.applicable_months);
                                            const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
                                            return (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    📅 {months.map(m => monthNames[m - 1]).join(', ')}
                                                </p>
                                            );
                                        } catch (e) {
                                            return null;
                                        }
                                    })()}
                                    <p className="text-sm text-slate-500 mt-1">
                                        <span className="font-medium text-slate-700">€ {expense.toFixed(2)}</span>
                                        <span className="mx-1">/</span>
                                        € {budget.amount.toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => handleEdit(budget)}
                                        className="text-slate-300 hover:text-emerald-600 p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                                        title="Modifica"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(budget)}
                                        className="text-slate-300 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Elimina"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="relative pt-2">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${isOver ? 'text-rose-600 bg-rose-100' :
                                            isWarning ? 'text-amber-600 bg-amber-100' :
                                                'text-emerald-600 bg-emerald-100'
                                            }`}>
                                            {isOver ? 'Superato' : isWarning ? 'Attenzione' : 'In linea'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs font-semibold inline-block ${isOver ? 'text-rose-600' : 'text-slate-600'
                                            }`}>
                                            {percentage.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-slate-100">
                                    <div
                                        style={{ width: `${percentage}%` }}
                                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}
                                    ></div>
                                </div>
                            </div>

                            {isOver && (
                                <div className="flex items-center space-x-2 text-rose-600 text-xs mt-2 bg-rose-50 p-2 rounded-lg">
                                    <AlertCircle size={14} />
                                    <span>Hai superato il budget di € {(expense - budget.amount).toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    );
                })}

                <button
                    onClick={() => {
                        setEditingBudget({});
                        setFormData({ category: categories[0]?.name || '', amount: '', applicable_months: null });
                        setAllMonths(true);
                    }}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 min-h-[200px]"
                >
                    <div className="p-3 bg-slate-50 rounded-full mb-3 group-hover:bg-emerald-100 transition-colors">
                        <Plus size={24} />
                    </div>
                    <span className="font-medium">Aggiungi Budget</span>
                </button>
            </div>

            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Elimina Budget: {deleteModal.budget?.category}</h3>
                            <button
                                onClick={() => setDeleteModal({ open: false, budget: null, expenses: [] })}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="bg-amber-50 text-amber-800 p-4 rounded-xl mb-6 flex items-start space-x-3">
                                <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                                <div className="text-sm">
                                    <p className="font-medium">Ci sono {deleteModal.expenses.length} spese associate a questo budget.</p>
                                    <p className="mt-1 opacity-90">Puoi scegliere di riassegnarle a un'altra categoria o mantenerle con la categoria attuale (senza budget).</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Azione</label>
                                    <div className="space-y-3">
                                        <label className="flex items-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                            <input
                                                type="radio"
                                                name="action"
                                                checked={!reassignCategory}
                                                onChange={() => setReassignCategory('')}
                                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                            />
                                            <div className="ml-3">
                                                <span className="block text-sm font-medium text-slate-900">Elimina solo il budget</span>
                                                <span className="block text-xs text-slate-500">Le spese rimarranno con la categoria "{deleteModal.budget?.category}"</span>
                                            </div>
                                        </label>

                                        <label className="flex items-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                            <input
                                                type="radio"
                                                name="action"
                                                checked={!!reassignCategory}
                                                onChange={() => setReassignCategory(categories.find(c => c.name !== deleteModal.budget?.category)?.name || '')}
                                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                            />
                                            <div className="ml-3 flex-1">
                                                <span className="block text-sm font-medium text-slate-900">Riassegna spese e elimina</span>
                                                <span className="block text-xs text-slate-500">Sposta tutte le spese in una nuova categoria</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {reassignCategory !== '' && ( // Show select only if reassign option is selected (or logic implies it)
                                    // Actually better logic: if user clicks radio "Reassign", we set reassignCategory to first available.
                                    // If user clicks "Delete only", we set it to empty.
                                    // So here we check if we should show the dropdown.
                                    // But wait, if I use the radio button logic above, I need to know if "Reassign" is selected.
                                    // I can use a separate state `actionType` or just infer from `reassignCategory`.
                                    // Let's infer: if reassignCategory is truthy, we show dropdown. 
                                    // BUT empty string is falsy, so checking !!reassignCategory works for the radio checked state IF we set a default.
                                    // Let's refine the radio logic in the render.
                                    <div className="pl-7 animate-in slide-in-from-top-2">
                                        <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Nuova Categoria</label>
                                        <div className="flex items-center space-x-2">
                                            <ArrowRight size={16} className="text-slate-400" />
                                            <select
                                                value={reassignCategory}
                                                onChange={e => setReassignCategory(e.target.value)}
                                                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2 text-sm"
                                            >
                                                {categories
                                                    .filter(c => c.name !== deleteModal.budget?.category)
                                                    .map(c => (
                                                        <option key={c.id} value={c.name}>{c.name}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, budget: null, expenses: [] })}
                                className="px-5 py-2.5 text-slate-600 hover:bg-white hover:shadow-sm rounded-xl font-medium transition-all"
                            >
                                Annulla
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-5 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-medium shadow-sm hover:shadow-md transition-all flex items-center space-x-2"
                            >
                                <Trash2 size={18} />
                                <span>Conferma Eliminazione</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Movements Modal */}
            <CategoryMovementsModal
                isOpen={movementsModal.open}
                onClose={() => setMovementsModal({ open: false, category: null })}
                category={movementsModal.category}
            />
        </div>
    );
};

export default Budgets;
