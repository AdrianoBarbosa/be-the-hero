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

export function isAuthenticated() {
    return Boolean(getToken());
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ONG_NAME_KEY);
}
