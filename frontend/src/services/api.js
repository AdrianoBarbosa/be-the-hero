import axios from 'axios';

import { clearSession, getToken } from './auth';
import { redirectToLogon } from './navigation';

const PUBLIC_AUTH_ENDPOINTS = ['sessions', 'ongs'];

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333'
});

api.interceptors.request.use(config => {
    const token = getToken();

    if (token)
        config.headers.Authorization = `Bearer ${token}`;

    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        // Token expirado ou inválido: encerra a sessão e volta para o logon.
        // Um 401 no próprio logon ou cadastro é só credencial errada e fica a cargo da página.
        const isAuthRequest = PUBLIC_AUTH_ENDPOINTS.includes(String(error.config?.url));

        if (error.response?.status === 401 && getToken() && !isAuthRequest) {
            clearSession();
            redirectToLogon();
        }

        return Promise.reject(error);
    }
);

export default api;
