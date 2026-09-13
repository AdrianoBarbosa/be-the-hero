import React from 'react';
import { BrowserRouter, Route, Routes as Switch } from 'react-router';

import PrivateRoute from './components/PrivateRoute';

import Logon from './pages/Logon'
import Register from './pages/Register'
import Profile from './pages/Profile'
import NewIncident from './pages/NewIncident'

export function AppRoutes() {
    return (
        <Switch>
            <Route path="/" element={<Logon />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/incidents/new" element={<PrivateRoute><NewIncident /></PrivateRoute>} />
        </Switch>
    );
}

export default function Routes(){
    return(
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}
