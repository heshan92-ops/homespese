import React, { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import api from '../api/client';

const CategoryMovementsModal = ({ isOpen, onClose, category, month, year }) => {
    const [movements, setMovements] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, count: 0 });

    useEffect(() => {
        if (isOpen && category) {
            fetchMovements();
        }
    }, [isOpen, category, month, year]);

    const fetchMovements = async () => {
        setIsLoading(true);
        try {
            const params = {};
            if (month) params.month = month;
            if (year) params.year = year;

            const res = await api.get('/movements', { params });

            // Filtra per categoria
            const filtered = res.data.filter(m => m.category === category);
            setMovements(filtered);

            // Calcola statistiche
            const total = filtered.reduce((sum, m) => sum + m.amount, 0);
            setStats({ total, count: filtered.length });
        } catch (error) {
            console.error('Error fetching movements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-4 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">
                                Movimenti: {category}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {month && year ? `${month}/${year}` : 'Tutti i periodi'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={24} className="text-slate-600" />
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
                            <p className="text-xs text-slate-600 mb-1">Totale Spese</p>
                            <p className="text-2xl font-bold text-slate-800">
                                €{stats.total.toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl">
                            <p className="text-xs text-slate-600 mb-1">Movimenti</p>
                            <p className="text-2xl font-bold text-slate-800">
                                {stats.count}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-500">
                            Caricamento...
                        </div>
                    ) : movements.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-slate-400 mb-2">
                                <TrendingDown size={48} className="mx-auto" />
                            </div>
                            <p className="text-slate-600 font-medium">Nessun movimento trovato</p>
                            <p className="text-sm text-slate-500 mt-1">
                                Non ci sono movimenti per questa categoria nel periodo selezionato
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {movements.map((movement) => (
                                <div
                                    key={movement.id}
                                    className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className={`p-2 rounded-full ${movement.type === 'INCOME'
                                                    ? 'bg-emerald-100 text-emerald-600'
                                                    : 'bg-rose-100 text-rose-600'
                                                }`}>
                                                {movement.type === 'INCOME' ? (
                                                    <TrendingUp size={18} />
                                                ) : (
                                                    <TrendingDown size={18} />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-800">
                                                    {movement.description || movement.category}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                    <Calendar size={12} />
                                                    <span>{formatDate(movement.date)}</span>
                                                    {movement.is_planned && (
                                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                                                            Pianificata
                                                        </span>
                                                    )}
                                                    {movement.from_recurring_id && (
                                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                                                            Ricorrente
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-bold ${movement.type === 'INCOME'
                                                    ? 'text-emerald-600'
                                                    : 'text-slate-700'
                                                }`}>
                                                {movement.type === 'EXPENSE' && '-'}€{movement.amount.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="w-full py-2 px-4 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
                    >
                        Chiudi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryMovementsModal;
