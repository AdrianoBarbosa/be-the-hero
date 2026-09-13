const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

module.exports = function authenticate(request, response, next) {
    const { authorization } = request.headers;

    if (!authorization)
        return response.status(401).json({ error: 'Token not provided.' });

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token)
        return response.status(401).json({ error: 'Malformed token.' });

    try {
        const payload = jwt.verify(token, authConfig.secret, {
            algorithms: [authConfig.algorithm],
        });

        request.ongId = payload.sub;

        return next();
    } catch (err) {
        return response.status(401).json({ error: 'Invalid or expired token.' });
    }
};
