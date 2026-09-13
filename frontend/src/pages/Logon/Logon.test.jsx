import { screen, waitFor } from '@testing-library/react';

import api from '../../services/api';
import { getOngName, getToken } from '../../services/auth';
import { expectLocation, renderApp } from '../../tests/renderApp';
import { validToken } from '../../tests/token';

const TOKEN = validToken();

describe('Logon page', () => {
    it('logs in, stores the JWT and goes to the profile', async () => {
        vi.spyOn(api, 'post').mockResolvedValue({ data: { name: 'APAE', token: TOKEN } });
        vi.spyOn(api, 'get').mockResolvedValue({ data: [] });

        const { user } = renderApp('/');

        await user.type(screen.getByPlaceholderText('Sua ID'), 'abcd1234');
        await user.type(screen.getByPlaceholderText('Sua senha'), 'senha-forte-123');
        await user.click(screen.getByRole('button', { name: 'Entrar' }));

        await expectLocation('/profile');
        expect(api.post).toHaveBeenCalledWith('sessions', { id: 'abcd1234', password: 'senha-forte-123' });
        expect(getToken()).toBe(TOKEN);
        expect(getOngName()).toBe('APAE');
        expect(localStorage.getItem('ongId')).toBeNull();
    });

    it('shows an error and stays on logon when the login fails', async () => {
        vi.spyOn(api, 'post').mockRejectedValue(new Error('400'));
        vi.spyOn(window, 'alert').mockImplementation(() => {});

        const { user } = renderApp('/');

        await user.type(screen.getByPlaceholderText('Sua ID'), 'abcd1234');
        await user.type(screen.getByPlaceholderText('Sua senha'), 'senha-errada');
        await user.click(screen.getByRole('button', { name: 'Entrar' }));

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Falha no login, tente novamente.'));
        expect(getToken()).toBeNull();
        await expectLocation('/');
    });
});
