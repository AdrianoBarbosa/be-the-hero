const jwt = require('jsonwebtoken');

const connection = require('../database/connection');
const authConfig = require('../config/auth');
const { hashPassword, verifyPassword } = require('../utils/password');

// Hash usado quando o ID não existe, para que o tempo de resposta não revele quais IDs são válidos.
const dummyHash = hashPassword('dummy-password-for-timing');

module.exports = {
    async create(request, response) {
        const { id, password } = request.body;

        const ong = await connection('ongs')
            .where('id', id)
            .select('name', 'password_hash')
            .first();

        const passwordMatches = await verifyPassword(password, ong?.password_hash || await dummyHash);

        if (!ong?.password_hash || !passwordMatches)
            return response.status(401).json({ error: 'Invalid ID or password.' });

        const token = jwt.sign({}, authConfig.secret, {
            subject: id,
            expiresIn: authConfig.expiresIn,
            algorithm: authConfig.algorithm,
        });

        return response.json({ name: ong.name, token });
    }
};
