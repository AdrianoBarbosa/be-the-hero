import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import Incidents from '../src/pages/Incidents';
import api from '../src/services/api';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
}));

const incident = (id, overrides = {}) => ({
    id,
    title: `Caso ${id}`,
    description: `Descrição ${id}`,
    value: 120,
    name: 'APAE',
    email: 'contato@apae.org',
    whatsapp: '19900000000',
    city: 'Limeira',
    uf: 'SP',
    ...overrides,
});

function mockPage(data, total) {
    return { data, headers: { 'x-total-count': String(total) } };
}

describe('Incidents screen', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        mockNavigate.mockClear();
    });

    it('loads the first page and shows the total', async () => {
        jest.spyOn(api, 'get').mockResolvedValue(mockPage([incident(1), incident(2)], 2));

        await render(<Incidents />);

        expect(await screen.findByText('Caso 1')).toBeTruthy();
        expect(screen.getByText('Caso 2')).toBeTruthy();
        expect(screen.getByText('2 casos')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('incidents', { params: { page: 1 } });
    });

    it('formats the value as BRL currency', async () => {
        jest.spyOn(api, 'get').mockResolvedValue(mockPage([incident(1, { value: 1234.5 })], 1));

        await render(<Incidents />);

        expect(await screen.findByText(/R\$\s1\.234,50/)).toBeTruthy();
    });

    it('loads the next page on scroll end and stops when everything is loaded', async () => {
        jest.spyOn(api, 'get')
            .mockResolvedValueOnce(mockPage([1, 2, 3, 4, 5].map(id => incident(id)), 6))
            .mockResolvedValueOnce(mockPage([incident(6)], 6));

        await render(<Incidents />);
        await screen.findByText('Caso 5');

        const list = screen.getByTestId('incident-list');

        await fireEvent(list, 'endReached');
        expect(await screen.findByText('Caso 6')).toBeTruthy();
        expect(api.get).toHaveBeenLastCalledWith('incidents', { params: { page: 2 } });

        await fireEvent(list, 'endReached');
        expect(api.get).toHaveBeenCalledTimes(2);
    });

    it('navigates to the detail screen', async () => {
        const first = incident(1);
        jest.spyOn(api, 'get').mockResolvedValue(mockPage([first], 1));

        await render(<Incidents />);

        await fireEvent.press(await screen.findByText('Ver mais detalhes'));

        expect(mockNavigate).toHaveBeenCalledWith('Detail', { incident: first });
    });

    it('does not crash when the API fails', async () => {
        jest.spyOn(api, 'get').mockRejectedValue(new Error('Network Error'));

        await render(<Incidents />);

        await waitFor(() => expect(api.get).toHaveBeenCalled());
        expect(screen.getByText('0 casos')).toBeTruthy();
    });
});
