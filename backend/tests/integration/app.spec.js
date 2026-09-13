const { app, request, connection } = require('../helpers/factories');

describe('HTTP hardening', () => {
    afterAll(() => connection.destroy());

    it('does not disclose the framework and sets security headers', async () => {
        const response = await request(app).get('/unknown-route');

        expect(response.headers).not.toHaveProperty('x-powered-by');
        expect(response.headers['x-content-type-options']).toBe('nosniff');
        expect(response.headers).toHaveProperty('content-security-policy');
    });

    it('rejects bodies larger than 10kb', async () => {
        const response = await request(app)
            .post('/ongs')
            .send({ name: 'a'.repeat(20 * 1024) });

        expect(response.status).toBe(413);
    });
});
