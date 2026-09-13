const connection = require('../database/connection');

module.exports = {
    async index(request, response) {
        const incidents = await connection('incidents')
            .where('ong_id', request.ongId)
            .select('*');

        return response.json(incidents);
    }
};
