import { screen } from '@testing-library/react';

import api from '../../services/api';
import { getOngName, getToken } from '../../services/auth';
import { renderApp } from '../../tests/renderApp';

describe('Logon page', () => {
    it('logs in, stores the JWT and goes to the profile', async () => {
        vi.spyOn(api, 'post').mockResolvedValue({ data: { name: 'APAE', token: 'jwt-token' } });
        vi.spyOn(api, 'get').mockResolvedValue({ data: [] });

        const { user } = renderApp('/');

        await user.type(screen.getByPlaceholderText('Sua ID'), 'abcd1234');
        await user.click(screen.getByRole('button', { name: 'Entrar' }));

        expect(api.post).toHaveBeenCalledWith('sessions', { id: 'abcd1234' });
        expect(getToken()).toBe('jwt-token');
        expect(getOngName()).toBe('APAE');
        expect(await screen.findByTestId('location')).toHaveTextContent('/profile');
        expect(localStorage.getItem('ongId')).toBeNull();
    });

    it('shows an error and stays on logon when the login fails', async () => {
        vi.spyOn(api, 'post').mockRejectedValue(new Error('400'));
        vi.spyOn(window, 'alert').mockImplementation(() => {});

        const { user } = renderApp('/');

        await user.type(screen.getByPlaceholderText('Sua ID'), 'invalid');
        await user.click(screen.getByRole('button', { name: 'Entrar' }));

        expect(window.alert).toHaveBeenCalledWith('Falha no login, tente novamente.');
        expect(getToken()).toBeNull();
        expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/);
    });
});
