const connection = require("../database/connection")
const generateUniqueId = require('../utils/generateUniqueId');

module.exports = {

    async index (request, response) {
        // O ID é a credencial de acesso da ONG, então nunca deve ser exposto publicamente.
        const ongs = await connection('ongs').select('name', 'email', 'whatsapp', 'city', 'uf');

        return response.json(ongs);
    },

    async create(request, response) {
        const { name, email, whatsapp, city, uf } = request.body;

        const id = generateUniqueId();

        await connection('ongs').insert({
            id,
            name,
            email,
            whatsapp,
            city,
            uf,
        });

        return response.json({ id });
    }
}
