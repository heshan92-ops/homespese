import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, PieChart, Wallet, LogOut, User, Tag, Users, Menu, X, Settings, ChevronDown, Repeat } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import GlobalFab from './GlobalFab';

const NavItem = ({ to, icon: Icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={clsx(
                "flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200",
                isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "text-slate-600 hover:bg-white hover:shadow-sm"
            )}
        >
            <Icon size={18} />
            <span className="font-medium text-sm">{label}</span>
        </Link>
    );
};

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="bg-emerald-600 p-2 rounded-lg text-white">
                                <Wallet size={24} />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                                SpeseCasa
                            </span>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="hidden md:flex items-center space-x-2">
                                <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                                <NavItem to="/movements" icon={List} label="Movimenti" />
                                <NavItem to="/budgets" icon={PieChart} label="Budget" />
                                <NavItem to="/recurring" icon={Repeat} label="Ricorrenti" />
                                <NavItem to="/categories" icon={Tag} label="Categorie" />
                            </div>
                            <div className="hidden md:flex items-center space-x-4 pl-6 border-l border-slate-200 relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-colors focus:outline-none"
                                >
                                    <div className="bg-slate-100 p-1.5 rounded-full">
                                        <User size={16} />
                                    </div>
                                    <span className="text-sm font-medium hidden sm:block">{user?.username}</span>
                                    <ChevronDown size={14} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* User Dropdown */}
                                {isUserMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {user?.is_superuser && (
                                            <Link
                                                to="/users"
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <Users size={16} />
                                                <span>Gestione Utenti</span>
                                            </Link>
                                        )}
                                        {user?.is_superuser && (
                                            <Link
                                                to="/families"
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <Users size={16} />
                                                <span>Gestione Famiglie</span>
                                            </Link>
                                        )}
                                        <Link
                                            to="/settings"
                                            className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <Settings size={16} />
                                            <span>Impostazioni</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-slate-600 hover:bg-rose-50 hover:text-rose-600 text-left"
                                        >
                                            <LogOut size={16} />
                                            <span>Esci</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex md:hidden items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-slate-600 hover:text-emerald-600 p-2"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 animate-in slide-in-from-top-5 duration-200">
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            <div className="flex flex-col space-y-2">
                                <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                                <NavItem to="/movements" icon={List} label="Movimenti" />
                                <NavItem to="/budgets" icon={PieChart} label="Budget" />
                                <NavItem to="/recurring" icon={Repeat} label="Ricorrenti" />
                                <NavItem to="/categories" icon={Tag} label="Categorie" />
                                {user?.is_superuser && (
                                    <NavItem to="/users" icon={Users} label="Utenti" />
                                )}
                            </div>
                            <div className="pt-4 mt-4 border-t border-slate-100">
                                <div className="flex items-center px-4 py-2 space-x-3">
                                    <div className="bg-slate-100 p-1.5 rounded-full">
                                        <User size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600">{user?.username}</span>
                                </div>
                                <Link
                                    to="/settings"
                                    className="w-full mt-2 flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
                                >
                                    <Settings size={18} />
                                    <span className="font-medium text-sm">Impostazioni</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full mt-2 flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span className="font-medium text-sm">Esci</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
            <main className="flex-grow bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
            <GlobalFab />
        </div>
    );
};

export default Layout;
