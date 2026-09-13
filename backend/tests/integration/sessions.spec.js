const jwt = require('jsonwebtoken');

const { app, request, connection, createOng, resetDatabase } = require('../helpers/factories');
const authConfig = require('../../src/config/auth');

describe('POST /sessions', () => {
    beforeEach(resetDatabase);

    afterAll(() => connection.destroy());

    const login = body => request(app).post('/sessions').send(body);

    it('returns the ONG name and a signed JWT for valid credentials', async () => {
        const ong = await createOng();

        const response = await login({ id: ong.id, password: ong.password });

        expect(response.status).toBe(200);
        expect(response.body.name).toBe(ong.name);

        const payload = jwt.verify(response.body.token, authConfig.secret, { algorithms: ['HS256'] });
        expect(payload.sub).toBe(ong.id);
        expect(payload.exp).toBeGreaterThan(payload.iat);
    });

    it('returns 401 with a wrong password', async () => {
        const ong = await createOng();

        const response = await login({ id: ong.id, password: 'senha-errada' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Invalid ID or password.' });
    });

    it('returns the same 401 when the ONG does not exist, without revealing it', async () => {
        const response = await login({ id: 'abcdef12', password: 'qualquer-senha' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Invalid ID or password.' });
    });

    it('does not log in a legacy ONG without password', async () => {
        const ong = await createOng();
        await connection('ongs').where('id', ong.id).update({ password_hash: null });

        const response = await login({ id: ong.id, password: '' });

        expect(response.status).toBe(400);

        const withPassword = await login({ id: ong.id, password: 'qualquer-senha' });
        expect(withPassword.status).toBe(401);
    });

    it('returns 400 when the password is missing', async () => {
        const ong = await createOng();

        const response = await login({ id: ong.id });

        expect(response.status).toBe(400);
    });

    it('returns 400 when the id is not a valid ONG id', async () => {
        const response = await login({ id: "' OR 1=1 --", password: 'x' });

        expect(response.status).toBe(400);
    });
});
