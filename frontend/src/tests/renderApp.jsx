import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';

import { AppRoutes } from '../routes';

function LocationProbe() {
    const location = useLocation();

    return <span data-testid="location">{location.pathname}</span>;
}

export function renderApp(route = '/') {
    return {
        user: userEvent.setup(),
        ...render(
            <MemoryRouter initialEntries={[route]}>
                <AppRoutes />
                <LocationProbe />
            </MemoryRouter>
        ),
    };
}
