const { app, request, connection, ongData, createOng, resetDatabase } = require('../helpers/factories');

describe('ONGs', () => {
    beforeEach(resetDatabase);

    afterAll(() => connection.destroy());

    describe('POST /ongs', () => {
        it('creates an ONG and returns its access id', async () => {
            const response = await request(app).post('/ongs').send(ongData());

            expect(response.status).toBe(200);
            expect(response.body.id).toMatch(/^[0-9a-f]{8}$/);

            const saved = await connection('ongs').where('id', response.body.id).first();
            expect(saved).toMatchObject(ongData());
        });

        it.each([
            ['name is missing', { name: undefined }],
            ['email is invalid', { email: 'not-an-email' }],
            ['whatsapp has letters', { whatsapp: '1990000abcd' }],
            ['whatsapp is too short', { whatsapp: '199' }],
            ['uf has more than 2 chars', { uf: 'SPP' }],
        ])('returns 400 when %s', async (_, overrides) => {
            const response = await request(app).post('/ongs').send(ongData(overrides));

            expect(response.status).toBe(400);
            expect(await connection('ongs').count({ count: '*' })).toEqual([{ count: 0 }]);
        });

        it('rejects unknown fields such as a custom id', async () => {
            const response = await request(app).post('/ongs').send({ ...ongData(), id: 'deadbeef' });

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
        it('lists ONGs without exposing their access ids', async () => {
            await createOng();

            const response = await request(app).get('/ongs');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([ongData()]);
            expect(response.body[0]).not.toHaveProperty('id');
        });
    });
});
