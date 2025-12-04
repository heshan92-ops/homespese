import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Plus, Trash2, Edit2, Tag, List } from 'lucide-react';
import CategoryMovementsModal from '../components/CategoryMovementsModal';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', color: '#10b981' });
    const [movementsModal, setMovementsModal] = useState({ open: false, category: null });

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, formData);
            } else {
                await api.post('/categories', formData);
            }
            setShowForm(false);
            setEditingCategory(null);
            setFormData({ name: '', color: '#10b981' });
            fetchCategories();
        } catch (error) {
            console.error("Error saving category", error);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, color: category.color || '#10b981' });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Sei sicuro di voler eliminare questa categoria?')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchCategories();
            } catch (error) {
                console.error("Error deleting category", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Categorie</h1>
                    <p className="text-slate-500 text-sm">Gestisci le categorie di spesa</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: '', color: '#10b981' });
                        setShowForm(!showForm);
                    }}
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-emerald-700 transition-all shadow-sm hover:shadow-emerald-200 hover:shadow-md"
                >
                    <Plus size={20} />
                    <span>Nuova Categoria</span>
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800">{editingCategory ? 'Modifica Categoria' : 'Nuova Categoria'}</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nome</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                                placeholder="Es. Ristoranti"
                            />
                        </div>
                        <div className="w-full md:w-32">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Colore</label>
                            <input
                                type="color"
                                value={formData.color}
                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                                className="w-full h-[46px] rounded-xl border-slate-200 shadow-sm cursor-pointer"
                            />
                        </div>
                        <div className="flex space-x-3 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 md:flex-none px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium shadow-sm hover:shadow-md transition-all"
                            >
                                Salva
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                    <div key={cat.id}
                        className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setMovementsModal({ open: true, category: cat.name })}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
                                <Tag size={20} />
                            </div>
                            <span className="font-medium text-slate-700">{cat.name}</span>
                            <List size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => handleEdit(cat)}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(cat.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Movements Modal */}
            <CategoryMovementsModal
                isOpen={movementsModal.open}
                onClose={() => setMovementsModal({ open: false, category: null })}
                category={movementsModal.category}
            />
        </div>
    );
};

export default Categories;
