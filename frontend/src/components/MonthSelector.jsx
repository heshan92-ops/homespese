import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import api from '../api/client';

const MonthSelector = ({ selectedMonth, selectedYear, onChange, compact = false }) => {
    const [availableYears, setAvailableYears] = useState([]);

    const monthsShort = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const monthsFull = [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];

    useEffect(() => {
        fetchAvailableYears();
    }, []);

    const fetchAvailableYears = async () => {
        try {
            const res = await api.get('/dashboard/available-years');
            setAvailableYears(res.data.years || [new Date().getFullYear()]);
        } catch (error) {
            console.error("Error fetching available years", error);
            setAvailableYears([new Date().getFullYear()]);
        }
    };

    const handlePreviousYear = () => {
        const currentIndex = availableYears.indexOf(selectedYear);
        if (currentIndex > 0) {
            onChange(selectedMonth, availableYears[currentIndex - 1]);
        }
    };

    const handleNextYear = () => {
        const currentIndex = availableYears.indexOf(selectedYear);
        if (currentIndex < availableYears.length - 1) {
            onChange(selectedMonth, availableYears[currentIndex + 1]);
        }
    };

    const canGoPrevYear = () => {
        const currentIndex = availableYears.indexOf(selectedYear);
        return currentIndex > 0;
    };

    const canGoNextYear = () => {
        const currentIndex = availableYears.indexOf(selectedYear);
        return currentIndex < availableYears.length - 1;
    };

    if (compact) {
        // Compact vertical sidebar version
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 h-fit sticky top-6">
                {/* Header */}
                <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-slate-100">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <Calendar className="text-emerald-600" size={18} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-600">Periodo</h3>
                        <p className="text-xs text-slate-400">{monthsFull[selectedMonth - 1]}</p>
                    </div>
                </div>

                {/* Year Selector */}
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={handlePreviousYear}
                        disabled={!canGoPrevYear()}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-lg font-bold text-slate-800">{selectedYear}</span>
                    <button
                        onClick={handleNextYear}
                        disabled={!canGoNextYear()}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Month Grid - Vertical 3x4 */}
                <div className="grid grid-cols-3 gap-1.5">
                    {monthsShort.map((month, index) => {
                        const monthNum = index + 1;
                        const isSelected = monthNum === selectedMonth;

                        return (
                            <button
                                key={monthNum}
                                onClick={() => onChange(monthNum, selectedYear)}
                                className={`
                                    py-2.5 px-2 rounded-lg font-medium text-xs transition-all duration-200
                                    ${isSelected
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                    }
                                `}
                            >
                                {month}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Original horizontal version for other pages
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <Calendar className="text-emerald-600" size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">
                            {monthsFull[selectedMonth - 1]} {selectedYear}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-6 md:grid-cols-12 gap-2 mb-4">
                {monthsShort.map((month, index) => {
                    const monthNum = index + 1;
                    const isSelected = monthNum === selectedMonth;

                    return (
                        <button
                            key={monthNum}
                            onClick={() => onChange(monthNum, selectedYear)}
                            className={`
                                relative py-3 px-2 rounded-lg font-medium text-sm transition-all duration-200
                                ${isSelected
                                    ? 'bg-emerald-600 text-white shadow-md scale-105'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:scale-105'
                                }
                            `}
                        >
                            <span className="block">{month}</span>
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                    onClick={handlePreviousYear}
                    disabled={!canGoPrevYear()}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-500">Anno:</span>
                    <span className="text-lg font-bold text-slate-800">{selectedYear}</span>
                </div>

                <button
                    onClick={handleNextYear}
                    disabled={!canGoNextYear()}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default MonthSelector;
