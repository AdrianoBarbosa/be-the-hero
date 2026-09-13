import { screen, waitFor } from '@testing-library/react';

import api from '../../services/api';
import { expectLocation, renderApp } from '../../tests/renderApp';

async function fillForm(user, { password = 'senha-forte-123', confirmation = password } = {}) {
    await user.type(screen.getByPlaceholderText('Nome da ONG'), 'APAE');
    await user.type(screen.getByPlaceholderText('E-mail'), 'contato@apae.org');
    await user.type(screen.getByPlaceholderText('WhatsApp'), '19900000000');
    await user.type(screen.getByPlaceholderText('Cidade'), 'Limeira');
    await user.type(screen.getByPlaceholderText('UF'), 'SP');
    await user.type(screen.getByPlaceholderText('Senha (mínimo 8 caracteres)'), password);
    await user.type(screen.getByPlaceholderText('Confirme a senha'), confirmation);
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));
}

describe('Register page', () => {
    it('registers the ONG, shows the access id and goes to logon', async () => {
        vi.spyOn(api, 'post').mockResolvedValue({ data: { id: 'abcd1234' } });
        vi.spyOn(window, 'alert').mockImplementation(() => {});

        const { user } = renderApp('/register');

        await fillForm(user);

        expect(api.post).toHaveBeenCalledWith('ongs', {
            name: 'APAE',
            email: 'contato@apae.org',
            whatsapp: '19900000000',
            city: 'Limeira',
            uf: 'SP',
            password: 'senha-forte-123',
        });
        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Seu ID de acesso: abcd1234'));
        await expectLocation('/');
    });

    it.each([
        ['the password is too short', { password: '1234567' }, 'A senha deve ter pelo menos 8 caracteres.'],
        ['the confirmation does not match', { password: 'senha-forte-123', confirmation: 'outra-senha-123' }, 'As senhas não conferem.'],
    ])('does not submit when %s', async (_, passwords, message) => {
        vi.spyOn(api, 'post');
        vi.spyOn(window, 'alert').mockImplementation(() => {});

        const { user } = renderApp('/register');

        await fillForm(user, passwords);

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith(message));
        expect(api.post).not.toHaveBeenCalled();
    });

    it('shows an error when the registration fails', async () => {
        vi.spyOn(api, 'post').mockRejectedValue(new Error('400'));
        vi.spyOn(window, 'alert').mockImplementation(() => {});

        const { user } = renderApp('/register');

        await fillForm(user);

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Erro no cadastro, tente novamente.'));
        await expectLocation('/register');
    });
});
