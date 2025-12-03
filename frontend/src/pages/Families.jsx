import { useState, useEffect } from 'react';
import api from '../api/client';
import '../styles/Families.css';

export default function Families() {
    const [families, setFamilies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFamilies();
    }, []);

    const fetchFamilies = async () => {
        try {
            setLoading(true);
            const response = await api.get('/families');
            setFamilies(response.data);
        } catch (err) {
            console.error('Error fetching families:', err);
            setError('Errore nel caricamento delle famiglie');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('Il nome della famiglia è obbligatorio');
            return;
        }

        try {
            await api.post('/families', formData);
            setShowModal(false);
            setFormData({ name: '' });
            fetchFamilies();
        } catch (err) {
            console.error('Error creating family:', err);
            setError(err.response?.data?.detail || 'Errore nella creazione della famiglia');
        }
    };

    const handleCancel = () => {
        setShowModal(false);
        setFormData({ name: '' });
        setError('');
    };

    if (loading) {
        return <div className="loading">Caricamento...</div>;
    }

    return (
        <div className="families-container">
            <div className="families-header">
                <h1>Gestione Famiglie</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Nuova Famiglia
                </button>
            </div>

            {error && !showModal && <div className="alert alert-error">{error}</div>}

            <div className="families-table-container">
                <table className="families-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome Famiglia</th>
                            <th>Data Creazione</th>
                        </tr>
                    </thead>
                    <tbody>
                        {families.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="no-data">Nessuna famiglia trovata</td>
                            </tr>
                        ) : (
                            families.map((family) => (
                                <tr key={family.id}>
                                    <td>{family.id}</td>
                                    <td>{family.name}</td>
                                    <td>{new Date(family.created_at).toLocaleDateString('it-IT')}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Family Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCancel}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Nuova Famiglia</h2>
                            <button className="modal-close" onClick={handleCancel}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Nome Famiglia *</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="es. Famiglia Verdi"
                                    required
                                />
                            </div>
                            {error && <div className="alert alert-error">{error}</div>}
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                    Annulla
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Crea Famiglia
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
