import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

const PasswordStrengthIndicator = ({ password }) => {
    const [strength, setStrength] = useState(0);
    const [requirements, setRequirements] = useState([
        { id: 'length', label: 'Almeno 8 caratteri', met: false },
        { id: 'upper', label: 'Una lettera maiuscola', met: false },
        { id: 'lower', label: 'Una lettera minuscola', met: false },
        { id: 'number', label: 'Un numero', met: false },
        { id: 'special', label: 'Un carattere speciale', met: false },
    ]);

    useEffect(() => {
        const newRequirements = [...requirements];
        let score = 0;

        // Check length
        if (password.length >= 8) {
            newRequirements[0].met = true;
            score++;
        } else {
            newRequirements[0].met = false;
        }

        // Check uppercase
        if (/[A-Z]/.test(password)) {
            newRequirements[1].met = true;
            score++;
        } else {
            newRequirements[1].met = false;
        }

        // Check lowercase
        if (/[a-z]/.test(password)) {
            newRequirements[2].met = true;
            score++;
        } else {
            newRequirements[2].met = false;
        }

        // Check number
        if (/\d/.test(password)) {
            newRequirements[3].met = true;
            score++;
        } else {
            newRequirements[3].met = false;
        }

        // Check special char
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            newRequirements[4].met = true;
            score++;
        } else {
            newRequirements[4].met = false;
        }

        setRequirements(newRequirements);
        setStrength(score);
    }, [password]);

    const getStrengthColor = () => {
        if (strength <= 2) return 'bg-rose-500';
        if (strength <= 4) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const getStrengthLabel = () => {
        if (strength <= 2) return 'Debole';
        if (strength <= 4) return 'Media';
        return 'Forte';
    };

    return (
        <div className="space-y-3 mt-2">
            {/* Strength Bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                />
            </div>
            <p className="text-xs font-medium text-slate-500 text-right">
                Forza: <span className={`${strength <= 2 ? 'text-rose-600' : strength <= 4 ? 'text-amber-600' : 'text-emerald-600'}`}>{getStrengthLabel()}</span>
            </p>

            {/* Requirements List */}
            <ul className="space-y-1">
                {requirements.map(req => (
                    <li key={req.id} className="flex items-center space-x-2 text-xs">
                        {req.met ? (
                            <Check size={14} className="text-emerald-500" />
                        ) : (
                            <X size={14} className="text-slate-300" />
                        )}
                        <span className={req.met ? 'text-slate-700' : 'text-slate-400'}>
                            {req.label}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PasswordStrengthIndicator;
