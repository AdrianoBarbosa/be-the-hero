const TOKEN_KEY = 'token';
const ONG_NAME_KEY = 'ongName';

export function saveSession({ token, name }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ONG_NAME_KEY, name);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getOngName() {
    return localStorage.getItem(ONG_NAME_KEY);
}

function isExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));

        return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
    } catch (err) {
        return true;
    }
}

// A validade real é conferida pela API. Aqui só evitamos abrir páginas protegidas com um token vencido.
export function isAuthenticated() {
    const token = getToken();

    if (token && isExpired(token)) {
        clearSession();
        return false;
    }

    return Boolean(token);
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ONG_NAME_KEY);
}
