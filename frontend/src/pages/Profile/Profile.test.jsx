import { screen, within } from '@testing-library/react';

import api from '../../services/api';
import { getToken, saveSession } from '../../services/auth';
import { renderApp } from '../../tests/renderApp';

const incidents = [
    { id: 1, title: 'Caso 1', description: 'Descrição 1', value: 120 },
    { id: 2, title: 'Caso 2', description: 'Descrição 2', value: 50.5 },
];

describe('Profile page', () => {
    beforeEach(() => {
        saveSession({ token: 'jwt-token', name: 'APAE' });
    });

    it('redirects to logon when there is no session', () => {
        localStorage.clear();
        vi.spyOn(api, 'get');

        renderApp('/profile');

        expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/);
        expect(api.get).not.toHaveBeenCalled();
    });

    it('lists the incidents of the logged ONG', async () => {
        vi.spyOn(api, 'get').mockResolvedValue({ data: incidents });

        renderApp('/profile');

        expect(await screen.findByText('Caso 1')).toBeInTheDocument();
        expect(screen.getByText('Caso 2')).toBeInTheDocument();
        expect(screen.getByText('Bem vinda, APAE')).toBeInTheDocument();
        expect(api.get).toHaveBeenCalledWith('profile');
    });

    it('deletes an incident', async () => {
        vi.spyOn(api, 'get').mockResolvedValue({ data: incidents });
        vi.spyOn(api, 'delete').mockResolvedValue({ status: 204 });

        const { user } = renderApp('/profile');

        const item = (await screen.findByText('Caso 1')).closest('li');
        await user.click(within(item).getByRole('button'));

        expect(api.delete).toHaveBeenCalledWith('incidents/1');
        expect(screen.queryByText('Caso 1')).not.toBeInTheDocument();
        expect(screen.getByText('Caso 2')).toBeInTheDocument();
    });

    it('keeps the incident and warns when the deletion fails', async () => {
        vi.spyOn(api, 'get').mockResolvedValue({ data: incidents });
        vi.spyOn(api, 'delete').mockRejectedValue(new Error('403'));
        vi.spyOn(window, 'alert').mockImplementation(() => {});

        const { user } = renderApp('/profile');

        const item = (await screen.findByText('Caso 1')).closest('li');
        await user.click(within(item).getByRole('button'));

        expect(window.alert).toHaveBeenCalledWith('Erro ao deletar caso, tente novamente');
        expect(screen.getByText('Caso 1')).toBeInTheDocument();
    });

    it('logs out clearing the session', async () => {
        vi.spyOn(api, 'get').mockResolvedValue({ data: [] });

        const { user, container } = renderApp('/profile');

        await user.click(container.querySelector('header button'));

        expect(getToken()).toBeNull();
        expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/);
    });
});
