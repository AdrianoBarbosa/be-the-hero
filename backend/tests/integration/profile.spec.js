const {
    app,
    request,
    connection,
    createOng,
    createIncident,
    tokenFor,
    resetDatabase,
} = require('../helpers/factories');

describe('GET /profile', () => {
    beforeEach(resetDatabase);

    afterAll(() => connection.destroy());

    it('lists only the incidents of the authenticated ONG', async () => {
        const ong = await createOng();
        const other = await createOng({ name: 'Outra ONG' });

        await createIncident(ong.id, { title: 'Meu caso' });
        await createIncident(other.id, { title: 'Caso de outra ONG' });

        const response = await request(app)
            .get('/profile')
            .set('Authorization', `Bearer ${tokenFor(ong.id)}`);

        expect(response.status).toBe(200);
        expect(response.body.map(incident => incident.title)).toEqual(['Meu caso']);
    });

    it('returns 401 without a token', async () => {
        const response = await request(app).get('/profile');

        expect(response.status).toBe(401);
    });

    it('returns 401 with an expired token', async () => {
        const ong = await createOng();
        const expired = tokenFor(ong.id, { expiresIn: -1 });

        const response = await request(app)
            .get('/profile')
            .set('Authorization', `Bearer ${expired}`);

        expect(response.status).toBe(401);
    });
});
