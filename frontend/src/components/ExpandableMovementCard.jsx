import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/client';

const ExpandableMovementCard = ({ movement, onUpdate, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        type: movement.type,
        date: movement.date,
        amount: movement.amount,
        category: movement.category,
        description: movement.description || ''
    });
    const [categories, setCategories] = useState([]);

    const handleExpand = async () => {
        if (!isExpanded && categories.length === 0) {
            // Fetch categories when expanding for the first time
            try {
                const res = await api.get('/categories');
                setCategories(res.data);
            } catch (error) {
                console.error("Error fetching categories", error);
            }
        }
        setIsExpanded(!isExpanded);
        setIsEditing(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount)
            };
            await api.put(`/movements/${movement.id}`, payload);
            setIsEditing(false);
            setIsExpanded(false);
            onUpdate();
        } catch (error) {
            console.error("Error updating movement", error);
            alert('Errore durante il salvataggio. Controlla i dati inseriti.');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Eliminare questo movimento?')) {
            try {
                await api.delete(`/movements/${movement.id}`);
                onDelete();
            } catch (error) {
                console.error("Error deleting movement", error);
            }
        }
    };

    const handleCancel = () => {
        setFormData({
            type: movement.type,
            date: movement.date,
            amount: movement.amount,
            category: movement.category,
            description: movement.description || ''
        });
        setIsEditing(false);
    };

    return (
        <div className="border-b border-slate-100 last:border-0">
            {/* Collapsed View */}
            <div
                onClick={handleExpand}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
            >
                <div className="flex items-center space-x-3 flex-1">
                    <div className={`p-2 rounded-full ${movement.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {movement.type === 'INCOME' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">{movement.category}</p>
                        <p className="text-xs text-slate-500">
                            {new Date(movement.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                            {movement.description && ` • ${movement.description}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="text-right">
                        <p className={`font-bold text-sm ${movement.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {movement.type === 'EXPENSE' && '-'}€ {movement.amount.toFixed(2)}
                        </p>
                        {movement.is_planned && (
                            <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                                Prevista
                            </span>
                        )}
                    </div>
                    <div className="text-slate-400">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                </div>
            </div>

            {/* Expanded View */}
            {isExpanded && (
                <div className="px-4 pb-4 bg-slate-50/50 animate-in slide-in-from-top-2 duration-200">
                    {!isEditing ? (
                        /* View Mode */
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-slate-500 font-medium">Tipo:</span>
                                    <p className="text-slate-800">{movement.type === 'INCOME' ? 'Entrata' : 'Spesa'}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 font-medium">Data:</span>
                                    <p className="text-slate-800">
                                        {new Date(movement.date).toLocaleDateString('it-IT', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-500 font-medium">Categoria:</span>
                                    <p className="text-slate-800">{movement.category}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 font-medium">Importo:</span>
                                    <p className={`font-bold ${movement.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        € {movement.amount.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            {movement.description && (
                                <div className="text-sm">
                                    <span className="text-slate-500 font-medium">Descrizione:</span>
                                    <p className="text-slate-800 mt-1">{movement.description}</p>
                                </div>
                            )}
                            <div className="flex space-x-2 pt-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEdit(); }}
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
                                >
                                    <Edit2 size={16} />
                                    <span>Modifica</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                                    className="flex-1 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
                                >
                                    <Trash2 size={16} />
                                    <span>Elimina</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Edit Mode */
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="EXPENSE">Spesa</option>
                                        <option value="INCOME">Entrata</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Data</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Categoria</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Importo</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Descrizione</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Note..."
                                />
                            </div>
                            <div className="flex space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                                    className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                                >
                                    Salva
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExpandableMovementCard;
