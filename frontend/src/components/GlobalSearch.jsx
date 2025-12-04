import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, Tag, Repeat } from 'lucide-react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
                setResults(res.data);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen]);

    const handleMovementClick = (movement) => {
        setIsOpen(false);
        setQuery('');
        navigate('/movements');
    };

    const handleCategoryClick = (category) => {
        setIsOpen(false);
        setQuery('');
        navigate('/categories');
    };

    const handleRecurringClick = (recurring) => {
        setIsOpen(false);
        setQuery('');
        navigate('/ricorrenti');
    };

    return (
        <>
            {/* Search Icon Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Cerca (Ctrl+K)"
            >
                <Search size={20} />
            </button>

            {/* Search Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[600px] flex flex-col animate-in slide-in-from-top-4 duration-200">
                        {/* Search Input */}
                        <div className="p-4 border-b border-slate-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Cerca movimenti, categorie, spese ricorrenti..."
                                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 text-lg"
                                />
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {isLoading && (
                                <div className="text-center py-8 text-slate-500">
                                    Ricerca in corso...
                                </div>
                            )}

                            {!isLoading && query.length < 2 && (
                                <div className="text-center py-8 text-slate-400">
                                    Digita almeno 2 caratteri per cercare
                                </div>
                            )}

                            {!isLoading && results && results.total_results === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    Nessun risultato trovato per "{query}"
                                </div>
                            )}

                            {!isLoading && results && results.total_results > 0 && (
                                <div className="space-y-6">
                                    {/* Movements */}
                                    {results.results.movements.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                                <TrendingDown size={16} />
                                                Movimenti ({results.results.movements.length})
                                            </h3>
                                            <div className="space-y-1">
                                                {results.results.movements.map((m) => (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => handleMovementClick(m)}
                                                        className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-full ${m.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                                {m.type === 'INCOME' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-800">{m.category}</p>
                                                                <p className="text-xs text-slate-500">
                                                                    {new Date(m.date).toLocaleDateString('it-IT')}
                                                                    {m.description && ` • ${m.description}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className={`font-bold ${m.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-700'}`}>
                                                            {m.type === 'EXPENSE' && '-'}€ {m.amount.toFixed(2)}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Categories */}
                                    {results.results.categories.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                                <Tag size={16} />
                                                Categorie ({results.results.categories.length})
                                            </h3>
                                            <div className="space-y-1">
                                                {results.results.categories.map((c) => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => handleCategoryClick(c)}
                                                        className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3"
                                                    >
                                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                                                            <Tag size={14} />
                                                        </div>
                                                        <span className="font-medium text-slate-800">{c.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recurring Expenses */}
                                    {results.results.recurring_expenses.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                                <Repeat size={16} />
                                                Spese Ricorrenti ({results.results.recurring_expenses.length})
                                            </h3>
                                            <div className="space-y-1">
                                                {results.results.recurring_expenses.map((r) => (
                                                    <button
                                                        key={r.id}
                                                        onClick={() => handleRecurringClick(r)}
                                                        className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                                                                <Repeat size={14} />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-800">{r.name}</p>
                                                                <p className="text-xs text-slate-500">{r.category}</p>
                                                            </div>
                                                        </div>
                                                        <span className="font-bold text-slate-700">
                                                            € {r.amount.toFixed(2)}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
                            <span>Premi ESC per chiudere</span>
                            {results && results.total_results > 0 && (
                                <span>{results.total_results} risultati trovati</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GlobalSearch;
