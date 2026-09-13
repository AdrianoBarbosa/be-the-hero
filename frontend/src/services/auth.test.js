import { clearSession, getOngName, getToken, isAuthenticated, saveSession } from './auth';

describe('auth service', () => {
    it('stores and reads the session', () => {
        saveSession({ token: 'jwt-token', name: 'APAE' });

        expect(getToken()).toBe('jwt-token');
        expect(getOngName()).toBe('APAE');
        expect(isAuthenticated()).toBe(true);
    });

    it('is not authenticated without a token', () => {
        expect(isAuthenticated()).toBe(false);
    });

    it('clears only the session keys', () => {
        localStorage.setItem('other', 'value');
        saveSession({ token: 'jwt-token', name: 'APAE' });

        clearSession();

        expect(isAuthenticated()).toBe(false);
        expect(getOngName()).toBeNull();
        expect(localStorage.getItem('other')).toBe('value');
    });
});
