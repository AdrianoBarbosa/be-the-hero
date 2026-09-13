import { clearSession, getOngName, getToken, isAuthenticated, saveSession } from './auth';

const base64url = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const jwtWith = payload => `${base64url({ alg: 'HS256' })}.${base64url(payload)}.signature`;
const nowInSeconds = () => Math.floor(Date.now() / 1000);

describe('auth service', () => {
    it('stores and reads the session', () => {
        const token = jwtWith({ sub: 'abcd1234', exp: nowInSeconds() + 3600 });
        saveSession({ token, name: 'APAE' });

        expect(getToken()).toBe(token);
        expect(getOngName()).toBe('APAE');
        expect(isAuthenticated()).toBe(true);
    });

    it('drops an expired session', () => {
        saveSession({ token: jwtWith({ sub: 'abcd1234', exp: nowInSeconds() - 60 }), name: 'APAE' });

        expect(isAuthenticated()).toBe(false);
        expect(getToken()).toBeNull();
        expect(getOngName()).toBeNull();
    });

    it('drops a token that cannot be decoded', () => {
        saveSession({ token: 'not-a-jwt', name: 'APAE' });

        expect(isAuthenticated()).toBe(false);
    });

    it('is not authenticated without a token', () => {
        expect(isAuthenticated()).toBe(false);
    });

    it('clears only the session keys', () => {
        localStorage.setItem('other', 'value');
        saveSession({ token: jwtWith({ sub: 'abcd1234', exp: nowInSeconds() + 3600 }), name: 'APAE' });

        clearSession();

        expect(isAuthenticated()).toBe(false);
        expect(getOngName()).toBeNull();
        expect(localStorage.getItem('other')).toBe('value');
    });
});
