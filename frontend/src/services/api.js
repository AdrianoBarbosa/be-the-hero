import axios from 'axios';

import { clearSession, getToken } from './auth';
import { redirectToLogon } from './navigation';

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
        if (error.response?.status === 401 && getToken()) {
            clearSession();
            redirectToLogon();
        }

        return Promise.reject(error);
    }
);

export default api;
