const {
    app,
    request,
    connection,
    createOng,
    createIncident,
    tokenFor,
    resetDatabase,
} = require('../helpers/factories');

describe('Incidents', () => {
    let ong;
    let token;

    beforeEach(async () => {
        await resetDatabase();
        ong = await createOng();
        token = tokenFor(ong.id);
    });

    afterAll(() => connection.destroy());

    describe('GET /incidents', () => {
        it('lists incidents with ONG data, paginated by 5, and exposes the total', async () => {
            for (let i = 1; i <= 7; i++)
                await createIncident(ong.id, { title: `Caso ${i}` });

            const firstPage = await request(app).get('/incidents');
            const secondPage = await request(app).get('/incidents').query({ page: 2 });

            expect(firstPage.status).toBe(200);
            expect(firstPage.headers['x-total-count']).toBe('7');
            expect(firstPage.body).toHaveLength(5);
            expect(secondPage.body.map(incident => incident.title)).toEqual(['Caso 6', 'Caso 7']);
            expect(firstPage.body[0]).toMatchObject({
                title: 'Caso 1',
                name: ong.name,
                email: ong.email,
                whatsapp: ong.whatsapp,
                city: ong.city,
                uf: ong.uf,
            });
        });

        it('does not expose the ONG access id', async () => {
            await createIncident(ong.id);

            const response = await request(app).get('/incidents');

            expect(response.body[0]).not.toHaveProperty('ong_id');
            expect(JSON.stringify(response.body)).not.toContain(ong.id);
        });

        it('exposes X-Total-Count to browsers through CORS', async () => {
            const response = await request(app).get('/incidents').set('Origin', 'http://example.com');

            expect(response.headers['access-control-expose-headers']).toBe('X-Total-Count');
        });

        it.each(['0', '-1', 'abc'])('returns 400 for invalid page %s', async page => {
            const response = await request(app).get('/incidents').query({ page });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /incidents', () => {
        const incident = { title: 'Gato resgatado', description: 'Precisa de vacinas', value: 80.5 };

        it('creates an incident owned by the authenticated ONG', async () => {
            const response = await request(app)
                .post('/incidents')
                .set('Authorization', `Bearer ${token}`)
                .send(incident);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id');

            const saved = await connection('incidents').where('id', response.body.id).first();
            expect(saved).toMatchObject({ ...incident, ong_id: ong.id });
        });

        it('rejects an ong_id sent by the client', async () => {
            const response = await request(app)
                .post('/incidents')
                .set('Authorization', `Bearer ${token}`)
                .send({ ...incident, ong_id: 'deadbeef' });

            expect(response.status).toBe(400);
            expect(await connection('incidents').count({ count: '*' })).toEqual([{ count: 0 }]);
        });

        it('returns 401 without a token', async () => {
            const response = await request(app).post('/incidents').send(incident);

            expect(response.status).toBe(401);
        });

        it('returns 401 when the raw ONG id is used as authorization (legacy flow)', async () => {
            const response = await request(app)
                .post('/incidents')
                .set('Authorization', ong.id)
                .send(incident);

            expect(response.status).toBe(401);
        });

        it.each([
            ['title is missing', { title: undefined }],
            ['value is not a number', { value: 'abc' }],
            ['value is negative', { value: -10 }],
        ])('returns 400 when %s', async (_, overrides) => {
            const response = await request(app)
                .post('/incidents')
                .set('Authorization', `Bearer ${token}`)
                .send({ ...incident, ...overrides });

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /incidents/:id', () => {
        it('deletes an incident owned by the authenticated ONG', async () => {
            const { id } = await createIncident(ong.id);

            const response = await request(app)
                .delete(`/incidents/${id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(204);
            expect(await connection('incidents').where('id', id).first()).toBeUndefined();
        });

        it('returns 403 when the incident belongs to another ONG', async () => {
            const { id } = await createIncident(ong.id);
            const other = await createOng({ name: 'Outra ONG' });

            const response = await request(app)
                .delete(`/incidents/${id}`)
                .set('Authorization', `Bearer ${tokenFor(other.id)}`);

            expect(response.status).toBe(403);
            expect(await connection('incidents').where('id', id).first()).toBeDefined();
        });

        it('returns 404 when the incident does not exist', async () => {
            const response = await request(app)
                .delete('/incidents/999')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
        });

        it('returns 400 for a non numeric id', async () => {
            const response = await request(app)
                .delete('/incidents/abc')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(400);
        });

        it('returns 401 without a token', async () => {
            const { id } = await createIncident(ong.id);

            const response = await request(app).delete(`/incidents/${id}`);

            expect(response.status).toBe(401);
        });
    });
});
