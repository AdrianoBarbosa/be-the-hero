const jwt = require('jsonwebtoken');

const authenticate = require('../../src/middlewares/authenticate');
const authConfig = require('../../src/config/auth');

function run(authorization) {
    const request = { headers: authorization === undefined ? {} : { authorization } };
    const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    authenticate(request, response, next);

    return { request, response, next };
}

function expectUnauthorized({ response, next }, error) {
    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ error });
}

describe('authenticate middleware', () => {
    it('calls next and exposes the ong id for a valid token', () => {
        const token = jwt.sign({}, authConfig.secret, { subject: 'abcd1234', algorithm: 'HS256' });

        const { request, next, response } = run(`Bearer ${token}`);

        expect(next).toHaveBeenCalledTimes(1);
        expect(response.status).not.toHaveBeenCalled();
        expect(request.ongId).toBe('abcd1234');
    });

    it('rejects requests without the authorization header', () => {
        expectUnauthorized(run(), 'Token not provided.');
    });

    it.each([
        ['a raw ong id', 'abcd1234'],
        ['a wrong scheme', 'Basic abcd1234'],
        ['a scheme without token', 'Bearer'],
    ])('rejects %s', (_, header) => {
        expectUnauthorized(run(header), 'Malformed token.');
    });

    it('rejects a token signed with another secret', () => {
        const token = jwt.sign({}, 'x'.repeat(40), { subject: 'abcd1234' });

        expectUnauthorized(run(`Bearer ${token}`), 'Invalid or expired token.');
    });

    it('rejects an expired token', () => {
        const token = jwt.sign({ exp: Math.floor(Date.now() / 1000) - 60 }, authConfig.secret, { subject: 'abcd1234' });

        expectUnauthorized(run(`Bearer ${token}`), 'Invalid or expired token.');
    });

    it('rejects an unsigned token (alg none)', () => {
        const token = jwt.sign({}, null, { subject: 'abcd1234', algorithm: 'none' });

        expectUnauthorized(run(`Bearer ${token}`), 'Invalid or expired token.');
    });

    it('rejects a garbage token', () => {
        expectUnauthorized(run('Bearer not.a.jwt'), 'Invalid or expired token.');
    });
});
