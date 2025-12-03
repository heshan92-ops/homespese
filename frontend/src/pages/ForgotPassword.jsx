import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Wallet, CheckCircle } from 'lucide-react';
import api from '../api/client';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            await api.post('/config/forgot-password', null, {
                params: { email }
            });
            setStatus('success');
            setMessage('Se l\'indirizzo email è registrato, riceverai un link per reimpostare la password.');
        } catch (error) {
            setStatus('error');
            setMessage('Si è verificato un errore. Riprova più tardi.');
        }
    };

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
                    Password dimenticata?
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Inserisci la tua email e ti invieremo un link per reimpostarla.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
                    {status === 'success' ? (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">Controlla la tua email</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                {message}
                            </p>
                            <div className="mt-6">
                                <Link
                                    to="/login"
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
                                >
                                    Torna al login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                    Indirizzo Email
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 sm:text-sm border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 py-2.5"
                                        placeholder="nome@esempio.com"
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
                                    {status === 'loading' ? 'Invio in corso...' : 'Invia link di reset'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">
                                    Oppure
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500 flex items-center justify-center space-x-1">
                                <ArrowLeft size={16} />
                                <span>Torna al login</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
