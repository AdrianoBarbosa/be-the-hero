const jwt = require('jsonwebtoken');

const { app, request, connection, createOng, resetDatabase } = require('../helpers/factories');
const authConfig = require('../../src/config/auth');

describe('POST /sessions', () => {
    beforeEach(resetDatabase);

    afterAll(() => connection.destroy());

    it('returns the ONG name and a signed JWT for a valid id', async () => {
        const ong = await createOng();

        const response = await request(app).post('/sessions').send({ id: ong.id });

        expect(response.status).toBe(200);
        expect(response.body.name).toBe(ong.name);

        const payload = jwt.verify(response.body.token, authConfig.secret, { algorithms: ['HS256'] });
        expect(payload.sub).toBe(ong.id);
        expect(payload.exp).toBeGreaterThan(payload.iat);
    });

    it('returns 400 when the ONG does not exist', async () => {
        const response = await request(app).post('/sessions').send({ id: 'abcdef12' });

        expect(response.status).toBe(400);
        expect(response.body).not.toHaveProperty('token');
    });

    it('returns 400 when the id is not a valid ONG id', async () => {
        const response = await request(app).post('/sessions').send({ id: "' OR 1=1 --" });

        expect(response.status).toBe(400);
    });
});
