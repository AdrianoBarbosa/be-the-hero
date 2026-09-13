const connection = require("../database/connection")
const generateUniqueId = require('../utils/generateUniqueId');
const { hashPassword } = require('../utils/password');

module.exports = {

    async index (request, response) {
        // O ID é a credencial de acesso da ONG, então nunca deve ser exposto publicamente.
        const ongs = await connection('ongs').select('name', 'email', 'whatsapp', 'city', 'uf');

        return response.json(ongs);
    },

    async create(request, response) {
        const { name, email, whatsapp, city, uf, password } = request.body;

        const id = generateUniqueId();
        const password_hash = await hashPassword(password);

        await connection('ongs').insert({
            id,
            name,
            email,
            whatsapp,
            city,
            uf,
            password_hash,
        });

        return response.json({ id });
    }
}
