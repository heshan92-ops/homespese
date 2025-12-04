import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { TrendingUp, TrendingDown, Wallet, Target, AlertCircle } from 'lucide-react';
import MonthSelector from '../components/MonthSelector';
import { useFab } from '../context/FabContext';
import { useAuth } from '../context/AuthContext';  // NEW
import ExpandableMovementCard from '../components/ExpandableMovementCard';
import CategoryMovementsModal from '../components/CategoryMovementsModal';

const Dashboard = () => {
    const { user } = useAuth();  // NEW: Get user info
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [budgetStatus, setBudgetStatus] = useState([]);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const { lastUpdate, setFabDate } = useFab(); // Use context
    const [movements, setMovements] = useState([]); // NEW
    const [movementsModal, setMovementsModal] = useState({ open: false, category: null });

    useEffect(() => {
        // Ensure FAB uses today's date when on Dashboard
        setFabDate(new Date().toISOString().split('T')[0]);
    }, [setFabDate]);

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear, lastUpdate]); // Refetch on global update

    const fetchData = async () => {
        setIsTransitioning(true);
        try {
            const params = { month: selectedMonth, year: selectedYear };
            const [summaryRes, budgetRes, movementsRes] = await Promise.all([
                api.get('/dashboard/summary', { params }),
                api.get('/dashboard/budget-status', { params }),
                api.get('/movements', { params }) // Fetch movements
            ]);
            setSummary(summaryRes.data);
            setBudgetStatus(budgetRes.data.budgets || budgetRes.data);
            setMovements(movementsRes.data); // Set movements
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        } finally {
            setTimeout(() => setIsTransitioning(false), 150);
        }
    };

    const handleMonthChange = (month, year) => {
        setSelectedMonth(month);
        setSelectedYear(year);
    };

    // NEW: Format welcome message
    const getWelcomeMessage = () => {
        const name = user?.first_name || user?.last_name
            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
            : user?.username;
        return `Benvenuto${user?.first_name ? '' : ''}, ${name}`;
    };

    return (
        <>
            <div className="flex flex-col md:flex-row gap-6">
                {/* LEFT SIDEBAR - RESPONSIVE */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="md:sticky md:top-24 space-y-4">

                        {/* KPI Cards - TOP */}
                        <div className={`space-y-3 transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>

                            {/* Welcome Card - NEW */}
                            {user && (
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                    <p className="text-xs text-slate-500 mb-1">Benvenuto,</p>
                                    <h3 className="font-bold text-slate-800 truncate" title={getWelcomeMessage().replace('Benvenuto, ', '')}>
                                        {getWelcomeMessage().replace('Benvenuto, ', '')} 👋
                                    </h3>
                                </div>
                            )}

                            {/* Saldo Attuale - HERO */}
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-xl shadow-md text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                                        <Wallet size={18} />
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-blue-100 mb-1">Saldo Attuale</p>
                                <h3 className="text-2xl font-bold">
                                    € {summary.balance.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h3>
                                <div className="mt-3 pt-3 border-t border-white/20">
                                    <span className={`text-xs font-semibold ${summary.balance >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                                        {summary.balance >= 0 ? '+' : ''}{summary.balance.toFixed(2)}€
                                    </span>
                                </div>
                            </div>

                            {/* Spese/Entrate Grid for Mobile */}
                            <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                                {/* Spese Totali */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 rounded-lg bg-rose-50">
                                            <TrendingDown size={18} className="text-rose-600" />
                                        </div>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 mb-1">Spese Totali</p>
                                    <h3 className="text-lg md:text-2xl font-bold text-rose-600 truncate">
                                        € {summary.expense.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </h3>
                                </div>

                                {/* Entrate Totali */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 rounded-lg bg-emerald-50">
                                            <TrendingUp size={18} className="text-emerald-600" />
                                        </div>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 mb-1">Entrate Totali</p>
                                    <h3 className="text-lg md:text-2xl font-bold text-emerald-600 truncate">
                                        € {summary.income.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT */}
                <div className={`flex-1 transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
                    <div className="space-y-6">

                        {/* Month Selector - Horizontal at the top */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <MonthSelector
                                selectedMonth={selectedMonth}
                                selectedYear={selectedYear}
                                onChange={handleMonthChange}
                                compact={false}
                            />
                        </div>

                        {/* Recent Movements - NEW */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800">Ultimi Movimenti</h3>
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                    {movements.length} transazioni
                                </span>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {movements.length > 0 ? (
                                    <div>
                                        {movements.map((m) => (
                                            <ExpandableMovementCard
                                                key={m.id}
                                                movement={m}
                                                onUpdate={fetchData}
                                                onDelete={fetchData}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-sm">
                                        Nessun movimento in questo periodo
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Budget Monitoring */}
                        {budgetStatus.length > 0 ? (
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Andamento Budget</h2>
                                        <p className="text-slate-500 text-sm mt-1">Monitora i tuoi limiti di spesa mensili</p>
                                    </div>
                                    <div className="p-3 bg-emerald-50 rounded-xl">
                                        <Target className="text-emerald-600" size={28} />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {budgetStatus.map((budget, index) => {
                                        const getColor = (percentage) => {
                                            if (percentage < 75) return 'bg-emerald-500';
                                            if (percentage < 90) return 'bg-yellow-500';
                                            return 'bg-rose-500';
                                        };

                                        const getTextColor = (percentage) => {
                                            if (percentage < 75) return 'text-emerald-600';
                                            if (percentage < 90) return 'text-yellow-600';
                                            return 'text-rose-600';
                                        };

                                        const getBgColor = (percentage) => {
                                            if (percentage < 75) return 'bg-emerald-50';
                                            if (percentage < 90) return 'bg-yellow-50';
                                            return 'bg-rose-50';
                                        };

                                        return (
                                            <div key={index}
                                                className={`p-6 rounded-xl border-2 ${budget.percentage >= 90 ? 'border-rose-200' : 'border-slate-100'} ${getBgColor(budget.percentage)} transition-all cursor-pointer hover:shadow-md`}
                                                onClick={() => setMovementsModal({ open: true, category: budget.category })}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-bold text-slate-800">{budget.category}</h3>
                                                    <div className="flex items-center space-x-3">
                                                        {budget.percentage >= 90 && (
                                                            <AlertCircle size={20} className="text-rose-500 animate-pulse" />
                                                        )}
                                                        <span className={`text-2xl font-bold ${getTextColor(budget.percentage)}`}>
                                                            {budget.percentage.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mb-4">
                                                    <div className="h-4 bg-white/60 rounded-full overflow-hidden shadow-inner">
                                                        <div
                                                            className={`h-full ${getColor(budget.percentage)} transition-all duration-500 rounded-full`}
                                                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex justify-between items-center text-sm">
                                                    <div>
                                                        <span className="text-slate-600 font-medium">Speso: </span>
                                                        <span className="text-slate-800 font-bold">€ {budget.spent.toFixed(2)}</span>
                                                        <span className="text-slate-400 mx-2">/</span>
                                                        <span className="text-slate-600">€ {budget.limit.toFixed(2)}</span>
                                                    </div>
                                                    <div className={`font-bold ${budget.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {budget.remaining >= 0 ? '✓ ' : '⚠ '}
                                                        {budget.remaining >= 0 ? 'Rimanenti' : 'Superato di'}: € {Math.abs(budget.remaining).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
                                <div className="p-4 bg-slate-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                    <Target className="text-slate-300" size={40} />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">Nessun Budget Configurato</h3>
                                <p className="text-slate-500 text-sm">Imposta i tuoi limiti di spesa mensili per monitorare le finanze</p>
                            </div>
                        )}

                        {/* Tip Card */}
                        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold mb-2">💡 Consiglio del Giorno</h3>
                                <p className="text-emerald-50 opacity-90 text-sm leading-relaxed">
                                    Controlla regolarmente i tuoi budget per evitare sorprese a fine mese.
                                    Un buon controllo delle spese è la chiave per risparmiare con successo!
                                </p>
                            </div>
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Movements Modal */}
            <CategoryMovementsModal
                isOpen={movementsModal.open}
                onClose={() => setMovementsModal({ open: false, category: null })}
                category={movementsModal.category}
                month={selectedMonth}
                year={selectedYear}
            />
        </>
    );
};

export default Dashboard;
