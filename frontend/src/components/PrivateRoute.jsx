import React from 'react';
import { Navigate } from 'react-router';

import { isAuthenticated } from '../services/auth';

export default function PrivateRoute({ children }) {
    if (!isAuthenticated())
        return <Navigate to="/" replace />;

    return children;
}
