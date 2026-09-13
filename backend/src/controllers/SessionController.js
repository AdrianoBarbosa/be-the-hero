const jwt = require('jsonwebtoken');

const connection = require('../database/connection');
const authConfig = require('../config/auth');

module.exports = {
    async create(request, response) {
        const { id } = request.body;

        const ong = await connection('ongs')
            .where('id', id)
            .select('name')
            .first();

        if (!ong)
            return response.status(400).json({ error: 'No ONG found with this ID' });

        const token = jwt.sign({}, authConfig.secret, {
            subject: id,
            expiresIn: authConfig.expiresIn,
            algorithm: authConfig.algorithm,
        });

        return response.json({ name: ong.name, token });
    }
};
