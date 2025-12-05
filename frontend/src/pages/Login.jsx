import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Lock, User } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Credenziali non valide');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-emerald-600 p-3 rounded-xl text-white mb-4 shadow-lg shadow-emerald-200">
                        <Wallet size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">SpeseCasa</h1>
                    <p className="text-slate-500">Accedi per gestire le tue finanze</p>
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm mb-6 text-center border border-rose-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="pl-10 w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                                placeholder="admin"
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 w-full rounded-xl border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-2.5"
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        </div>
                        <div className="flex justify-end mt-2">
                            <Link to="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-500 font-medium">
                                Password dimenticata?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        Accedi
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
