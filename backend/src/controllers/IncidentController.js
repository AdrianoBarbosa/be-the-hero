const connection = require('../database/connection');

const PAGE_SIZE = 5;

module.exports = {

    async index(request, response) {
        const { page = 1 } = request.query;

        const [{ count }] = await connection('incidents').count({ count: '*' });

        // ong_id fica de fora porque é a credencial de acesso da ONG.
        const incidents = await connection('incidents')
            .join('ongs', 'ongs.id', '=', 'incidents.ong_id')
            .limit(PAGE_SIZE)
            .offset((page - 1) * PAGE_SIZE)
            .select([
                'incidents.id',
                'incidents.title',
                'incidents.description',
                'incidents.value',
                'ongs.name',
                'ongs.email',
                'ongs.whatsapp',
                'ongs.city',
                'ongs.uf'
            ]);

        response.header('X-Total-Count', String(count));
        return response.json(incidents);
    },

    async create(request, response) {
        const { title, description, value } = request.body;
        const ong_id = request.ongId;

        const [id] = await connection('incidents').insert({
            title,
            description,
            value,
            ong_id
        });

        return response.json({ id });
    },

    async delete(request, response) {
        const { id } = request.params;
        const ong_id = request.ongId;

        const incident = await connection('incidents')
            .where('id', id)
            .select('ong_id')
            .first();

        if (!incident)
            return response.status(404).json({ error: 'Incident not found.' });

        if (incident.ong_id !== ong_id)
            return response.status(403).json({ error: 'Operation not permitted.' });

        await connection('incidents').where('id', id).delete();

        return response.status(204).send();
    }
}
