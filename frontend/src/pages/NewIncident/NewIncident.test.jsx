import { screen, waitFor } from '@testing-library/react';

import api from '../../services/api';
import { saveSession } from '../../services/auth';
import { expectLocation, renderApp } from '../../tests/renderApp';
import { validToken } from '../../tests/token';

const TOKEN = validToken();

async function fillForm(user) {
    await user.type(screen.getByPlaceholderText('Título do caso'), 'Gato resgatado');
    await user.type(screen.getByPlaceholderText('Descrição'), 'Precisa de vacinas');
    await user.type(screen.getByPlaceholderText('Valor em reais'), '80');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));
}

describe('NewIncident page', () => {
    it('redirects to logon when there is no session', async () => {
        renderApp('/incidents/new');

        await expectLocation('/');
    });

    it('creates the incident and goes back to the profile', async () => {
        saveSession({ token: TOKEN, name: 'APAE' });
        vi.spyOn(api, 'post').mockResolvedValue({ data: { id: 1 } });
        vi.spyOn(api, 'get').mockResolvedValue({ data: [] });

        const { user } = renderApp('/incidents/new');

        await fillForm(user);

        expect(api.post).toHaveBeenCalledWith('incidents', {
            title: 'Gato resgatado',
            description: 'Precisa de vacinas',
            value: '80',
        });
        await expectLocation('/profile');
    });

    it('shows an error when the creation fails', async () => {
        saveSession({ token: TOKEN, name: 'APAE' });
        vi.spyOn(api, 'post').mockRejectedValue(new Error('400'));
        vi.spyOn(window, 'alert').mockImplementation(() => {});

        const { user } = renderApp('/incidents/new');

        await fillForm(user);

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Erro ao cadastrar caso, tente novamente'));
        await expectLocation('/incidents/new');
    });
});
