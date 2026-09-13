const { app, request, connection, PASSWORD, ongData, createOng, resetDatabase } = require('../helpers/factories');
const { verifyPassword } = require('../../src/utils/password');

const payload = (overrides = {}) => ({ ...ongData(), password: PASSWORD, ...overrides });

describe('ONGs', () => {
    beforeEach(resetDatabase);

    afterAll(() => connection.destroy());

    describe('POST /ongs', () => {
        it('creates an ONG and returns its access id', async () => {
            const response = await request(app).post('/ongs').send(payload());

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ id: expect.stringMatching(/^[0-9a-f]{8}$/) });

            const saved = await connection('ongs').where('id', response.body.id).first();
            expect(saved).toMatchObject(ongData());
        });

        it('stores only a salted hash of the password', async () => {
            const first = await request(app).post('/ongs').send(payload());
            const second = await request(app).post('/ongs').send(payload());

            const [a, b] = await Promise.all([first, second].map(({ body }) =>
                connection('ongs').where('id', body.id).first()));

            expect(a).not.toHaveProperty('password');
            expect(a.password_hash).toMatch(/^scrypt\$/);
            expect(a.password_hash).not.toContain(PASSWORD);
            expect(a.password_hash).not.toBe(b.password_hash);
            expect(await verifyPassword(PASSWORD, a.password_hash)).toBe(true);
        });

        it.each([
            ['name is missing', { name: undefined }],
            ['email is invalid', { email: 'not-an-email' }],
            ['whatsapp has letters', { whatsapp: '1990000abcd' }],
            ['whatsapp is too short', { whatsapp: '199' }],
            ['uf has more than 2 chars', { uf: 'SPP' }],
            ['password is missing', { password: undefined }],
            ['password is shorter than 8 chars', { password: '1234567' }],
            ['password is longer than 128 chars', { password: 'a'.repeat(129) }],
        ])('returns 400 when %s', async (_, overrides) => {
            const response = await request(app).post('/ongs').send(payload(overrides));

            expect(response.status).toBe(400);
            expect(await connection('ongs').count({ count: '*' })).toEqual([{ count: 0 }]);
        });

        it('rejects unknown fields such as a custom id', async () => {
            const response = await request(app).post('/ongs').send(payload({ id: 'deadbeef' }));

            expect(response.status).toBe(400);
        });

        it('returns 400 for malformed JSON without leaking internals', async () => {
            const response = await request(app)
                .post('/ongs')
                .set('Content-Type', 'application/json')
                .send('{"name":');

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Invalid request body.' });
        });
    });

    describe('GET /ongs', () => {
        it('lists ONGs without exposing their access ids or password hashes', async () => {
            await createOng();

            const response = await request(app).get('/ongs');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([ongData()]);
            expect(response.body[0]).not.toHaveProperty('id');
            expect(response.body[0]).not.toHaveProperty('password_hash');
        });
    });
});
