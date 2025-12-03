import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Save, Mail, Server, Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('password');

    // SMTP State
    const [smtpConfig, setSmtpConfig] = useState({
        smtp_server: '',
        smtp_port: 587,
        smtp_username: '',
        smtp_password: '',
        from_email: '',
        use_tls: true
    });
    const [testEmail, setTestEmail] = useState('');
    const [smtpStatus, setSmtpStatus] = useState({ type: '', message: '' });

    // Password State
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        if (user?.is_superuser && activeTab === 'smtp') {
            fetchSmtpConfig();
        }
    }, [user, activeTab]);

    const fetchSmtpConfig = async () => {
        try {
            const res = await api.get('/config/smtp');
            // Don't overwrite password if it's empty (security)
            setSmtpConfig({ ...res.data, smtp_password: '' });
        } catch (error) {
            console.error("Error fetching SMTP config", error);
        }
    };

    const handleSmtpSubmit = async (e) => {
        e.preventDefault();
        setSmtpStatus({ type: 'loading', message: 'Salvataggio in corso...' });

        try {
            await api.put('/config/smtp', smtpConfig);
            setSmtpStatus({ type: 'success', message: 'Configurazione salvata con successo!' });
        } catch (error) {
            setSmtpStatus({ type: 'error', message: error.response?.data?.detail || 'Errore durante il salvataggio' });
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) return;
        setSmtpStatus({ type: 'loading', message: 'Invio email di test...' });

        try {
            await api.post('/config/smtp/test', null, { params: { test_email: testEmail } });
            setSmtpStatus({ type: 'success', message: 'Email di test inviata con successo!' });
        } catch (error) {
            setSmtpStatus({ type: 'error', message: error.response?.data?.detail || 'Errore durante l\'invio della mail di test' });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordStatus({ type: 'error', message: 'Le nuove password non coincidono' });
            return;
        }

        setPasswordStatus({ type: 'loading', message: 'Aggiornamento password...' });

        try {
            await api.post('/config/change-password', null, {
                params: {
                    old_password: passwordData.old_password,
                    new_password: passwordData.new_password
                }
            });
            setPasswordStatus({ type: 'success', message: 'Password aggiornata con successo!' });
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            setPasswordStatus({ type: 'error', message: error.response?.data?.detail || 'Errore durante l\'aggiornamento' });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Impostazioni</h1>
                <p className="text-slate-500 text-sm">Gestisci le preferenze del tuo account e del sistema</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('password')}
                        className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'password'
                            ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Sicurezza
                    </button>
                    {user?.is_superuser && (
                        <button
                            onClick={() => setActiveTab('smtp')}
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'smtp'
                                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            Configurazione Email (SMTP)
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {activeTab === 'password' && (
                        <div className="max-w-md mx-auto">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Cambia Password</h3>

                            {passwordStatus.message && (
                                <div className={`mb-4 p-4 rounded-xl flex items-start space-x-3 ${passwordStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800' :
                                    passwordStatus.type === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-blue-50 text-blue-800'
                                    }`}>
                                    {passwordStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    <p className="text-sm">{passwordStatus.message}</p>
                                </div>
                            )}

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password Attuale</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.old_password}
                                        onChange={e => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nuova Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.new_password}
                                        onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                    />
                                    <PasswordStrengthIndicator password={passwordData.new_password} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Conferma Nuova Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.confirm_password}
                                        onChange={e => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={passwordStatus.type === 'loading'}
                                    className="w-full bg-emerald-600 text-white py-2.5 rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    {passwordStatus.type === 'loading' ? 'Aggiornamento...' : 'Aggiorna Password'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'smtp' && user?.is_superuser && (
                        <div className="max-w-2xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-slate-800">Configurazione Server SMTP</h3>
                                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full flex items-center">
                                    <Shield size={12} className="mr-1" />
                                    Area Protetta
                                </span>
                            </div>

                            {smtpStatus.message && (
                                <div className={`mb-6 p-4 rounded-xl flex items-start space-x-3 ${smtpStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800' :
                                    smtpStatus.type === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-blue-50 text-blue-800'
                                    }`}>
                                    {smtpStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    <p className="text-sm">{smtpStatus.message}</p>
                                </div>
                            )}

                            <form onSubmit={handleSmtpSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Server SMTP</label>
                                    <div className="relative">
                                        <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="smtp.gmail.com"
                                            value={smtpConfig.smtp_server}
                                            onChange={e => setSmtpConfig({ ...smtpConfig, smtp_server: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Porta</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="587"
                                        value={smtpConfig.smtp_port}
                                        onChange={e => setSmtpConfig({ ...smtpConfig, smtp_port: parseInt(e.target.value) })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Usa TLS</label>
                                    <div className="flex items-center h-[42px]">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={smtpConfig.use_tls}
                                                onChange={e => setSmtpConfig({ ...smtpConfig, use_tls: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                            <span className="ml-3 text-sm font-medium text-slate-700">Attivo</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Username SMTP</label>
                                    <input
                                        type="text"
                                        required
                                        value={smtpConfig.smtp_username}
                                        onChange={e => setSmtpConfig({ ...smtpConfig, smtp_username: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password SMTP</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            required={!smtpConfig.id} // Required only if creating new config
                                            placeholder={smtpConfig.id ? "•••••••• (Lascia vuoto per non cambiare)" : ""}
                                            value={smtpConfig.smtp_password}
                                            onChange={e => setSmtpConfig({ ...smtpConfig, smtp_password: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Mittente</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            required
                                            placeholder="noreply@spesecasa.com"
                                            value={smtpConfig.from_email}
                                            onChange={e => setSmtpConfig({ ...smtpConfig, from_email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
                                    <div className="flex-1 mr-4">
                                        <div className="flex space-x-2">
                                            <input
                                                type="email"
                                                placeholder="Email per test..."
                                                value={testEmail}
                                                onChange={e => setTestEmail(e.target.value)}
                                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleTestEmail}
                                                disabled={!testEmail || smtpStatus.type === 'loading'}
                                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                Invia Test
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={smtpStatus.type === 'loading'}
                                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                                    >
                                        {smtpStatus.type === 'loading' ? 'Salvataggio...' : 'Salva Configurazione'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
