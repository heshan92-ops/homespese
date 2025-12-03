import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/client';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Le password non coincidono.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            await api.post('/config/reset-password', null, {
                params: {
                    token,
                    new_password: password
                }
            });
            setStatus('success');
            setMessage('La tua password è stata aggiornata con successo.');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.detail || 'Si è verificato un errore. Il link potrebbe essere scaduto.');
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
                    <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Link non valido</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Il link per il reset della password non è valido o manca il token.
                    </p>
                    <div className="mt-6">
                        <Link to="/login" className="text-emerald-600 hover:text-emerald-500 font-medium">
                            Torna al login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center items-center space-x-2 mb-6">
                    <div className="bg-emerald-600 p-2 rounded-lg text-white">
                        <Wallet size={28} />
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                        SpeseCasa
                    </span>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
                    Reimposta Password
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Inserisci la tua nuova password sicura.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
                    {status === 'success' ? (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">Password Aggiornata!</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                {message}
                            </p>
                            <p className="mt-4 text-xs text-slate-400">
                                Verrai reindirizzato al login tra pochi secondi...
                            </p>
                            <div className="mt-6">
                                <Link
                                    to="/login"
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
                                >
                                    Accedi subito
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                    Nuova Password
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 sm:text-sm border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 py-2.5"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <PasswordStrengthIndicator password={password} />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                                    Conferma Password
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 sm:text-sm border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 py-2.5"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="rounded-md bg-rose-50 p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-rose-800">Errore</h3>
                                            <div className="mt-2 text-sm text-rose-700">
                                                <p>{message}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === 'loading' ? 'Aggiornamento...' : 'Reimposta Password'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
