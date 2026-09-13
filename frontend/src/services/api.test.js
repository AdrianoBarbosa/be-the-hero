import api from './api';
import { getToken, saveSession } from './auth';
import { redirectToLogon } from './navigation';

vi.mock('./navigation', () => ({ redirectToLogon: vi.fn() }));

function mockAdapter(status = 200) {
    const adapter = vi.fn(config => {
        const response = { data: {}, status, statusText: '', headers: {}, config };

        if (status >= 400) {
            const error = new Error(`Request failed with status code ${status}`);
            error.response = response;
            error.config = config;
            return Promise.reject(error);
        }

        return Promise.resolve(response);
    });

    api.defaults.adapter = adapter;

    return adapter;
}

describe('api client', () => {
    beforeEach(() => {
        redirectToLogon.mockClear();
    });

    it('sends the JWT as a Bearer token when logged in', async () => {
        saveSession({ token: 'jwt-token', name: 'APAE' });
        const adapter = mockAdapter();

        await api.get('profile');

        expect(adapter.mock.calls[0][0].headers.Authorization).toBe('Bearer jwt-token');
    });

    it('does not send an Authorization header when logged out', async () => {
        const adapter = mockAdapter();

        await api.get('incidents');

        expect(adapter.mock.calls[0][0].headers.Authorization).toBeUndefined();
    });

    it('clears the session and redirects to logon on 401', async () => {
        saveSession({ token: 'expired', name: 'APAE' });
        mockAdapter(401);

        await expect(api.get('profile')).rejects.toThrow('401');

        expect(getToken()).toBeNull();
        expect(redirectToLogon).toHaveBeenCalledTimes(1);
    });

    it('does not redirect on 401 when there is no session (failed logon)', async () => {
        mockAdapter(401);

        await expect(api.post('sessions', { id: 'x' })).rejects.toThrow('401');

        expect(redirectToLogon).not.toHaveBeenCalled();
    });

    it.each(['sessions', 'ongs'])('keeps the session and does not redirect on a 401 from %s', async endpoint => {
        saveSession({ token: 'jwt-token', name: 'APAE' });
        mockAdapter(401);

        await expect(api.post(endpoint, {})).rejects.toThrow('401');

        expect(getToken()).toBe('jwt-token');
        expect(redirectToLogon).not.toHaveBeenCalled();
    });

    it('keeps the session on other errors', async () => {
        saveSession({ token: 'jwt-token', name: 'APAE' });
        mockAdapter(500);

        await expect(api.get('profile')).rejects.toThrow('500');

        expect(getToken()).toBe('jwt-token');
    });
});
