import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FiPower, FiTrash2 } from 'react-icons/fi';

import api from '../../services/api';
import { clearSession, getOngName } from '../../services/auth';

import logoImg from '../../assets/logo.svg';

import './styles.css';

export default function Profile() {
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState([]);

    const ongName = getOngName();

    useEffect(() => {
        api.get('profile')
            .then(response => {
                setIncidents(response.data);
            })
            .catch(err => {
                // 401 já é tratado pelo interceptor da API, que redireciona para o logon.
                if (err.response?.status !== 401)
                    alert('Erro ao carregar os casos, tente novamente');
            });
    }, []);

    async function handleDeleteIncident(id) {
        try {
            await api.delete(`incidents/${id}`);

            setIncidents(incidents.filter(incident => incident.id !== id));
        } catch (err) {
            alert('Erro ao deletar caso, tente novamente');
        }
    }

    function handleLogout() {
        clearSession();
        navigate('/');
    }

    return (
        <div className="profile-container">
            <header>
                <img src={logoImg} alt="Be The Hero"/>
                <span>Bem vinda, {ongName}</span>

                <Link className="button" to="/incidents/new">Cadastrar novo caso</Link>
                <button onClick={handleLogout} type="button">
                    <FiPower size={18} color="#E02041" />
                </button>
            </header>

            <h1>Casos cadastrados</h1>

            <ul>
                {incidents.map(incident => (
                    <li key={incident.id}>
                    <strong>CASO:</strong>
                    <p>{incident.title}</p>

                    <strong>DESCRIÇÃO:</strong>
                    <p>{incident.description}</p>

                    <strong>VALOR:</strong>
                    <p>{Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(incident.value)}</p>

                    <button onClick={() => handleDeleteIncident(incident.id)} type="button">
                        <FiTrash2 size={20} color="#a8a8b3" />
                    </button>
                </li>
                ))}
            </ul>
        </div>
    );
}