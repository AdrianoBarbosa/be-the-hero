import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as MailComposer from 'expo-mail-composer';

import Detail from '../src/pages/Detail';

const mockGoBack = jest.fn();

const incident = {
    id: 1,
    title: 'Cadelinha atropelada',
    description: 'Precisa de cirurgia',
    value: 120,
    name: 'APAE',
    email: 'contato@apae.org',
    whatsapp: '19900000000',
    city: 'Limeira',
    uf: 'SP',
};

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ goBack: mockGoBack }),
    useRoute: () => ({ params: { incident } }),
}));

jest.mock('expo-mail-composer', () => ({ composeAsync: jest.fn() }));

describe('Detail screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows the incident and ONG data', async () => {
        await render(<Detail />);

        expect(screen.getByText('APAE de Limeira/SP')).toBeTruthy();
        expect(screen.getByText('Precisa de cirurgia')).toBeTruthy();
        expect(screen.getByText(/R\$\s120,00/)).toBeTruthy();
    });

    it('composes an e-mail to the ONG', async () => {
        await render(<Detail />);

        await fireEvent.press(screen.getByText('E-mail'));

        expect(MailComposer.composeAsync).toHaveBeenCalledWith({
            subject: 'Herói do caso: Cadelinha atropelada',
            recipients: ['contato@apae.org'],
            body: expect.stringContaining('Olá APAE'),
        });
    });

    it('opens WhatsApp with an url encoded message', async () => {
        const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

        await render(<Detail />);

        await fireEvent.press(screen.getByText('WhatsApp'));

        const url = openURL.mock.calls[0][0];
        expect(url).toMatch(/^whatsapp:\/\/send\?phone=19900000000&text=/);
        expect(url).not.toContain(' ');
        expect(decodeURIComponent(url.split('text=')[1])).toContain('"Cadelinha atropelada"');
    });
});
