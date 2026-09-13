process.env.AUTH_RATE_LIMIT = '10';

const { app, request, connection, resetDatabase } = require('../helpers/factories');

describe('authentication rate limit', () => {
    beforeAll(resetDatabase);

    afterAll(() => connection.destroy());

    it('blocks brute force attempts on POST /sessions', async () => {
        const attempt = () => request(app).post('/sessions').send({ id: 'abcdef12', password: 'chute-qualquer' });

        for (let i = 0; i < 10; i++)
            expect((await attempt()).status).toBe(401);

        const blocked = await attempt();

        expect(blocked.status).toBe(429);
        expect(blocked.body).toEqual({ error: 'Too many attempts, please try again later.' });
    });

    it('keeps a separate counter for POST /ongs', async () => {
        const response = await request(app).post('/ongs').send({});

        expect(response.status).toBe(400);
    });
});
