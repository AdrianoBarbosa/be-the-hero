const { hashPassword, verifyPassword } = require('../../src/utils/password');

describe('password hashing', () => {
    it('verifies the right password', async () => {
        const hash = await hashPassword('senha-forte-123');

        expect(await verifyPassword('senha-forte-123', hash)).toBe(true);
    });

    it('rejects a wrong password', async () => {
        const hash = await hashPassword('senha-forte-123');

        expect(await verifyPassword('senha-forte-124', hash)).toBe(false);
    });

    it('uses a random salt for each hash', async () => {
        expect(await hashPassword('mesma-senha')).not.toBe(await hashPassword('mesma-senha'));
    });

    it('stores the cost parameters with the hash', async () => {
        const hash = await hashPassword('senha', { N: 2 ** 11, r: 8, p: 1 });

        expect(hash.split('$').slice(0, 4)).toEqual(['scrypt', '2048', '8', '1']);
        expect(await verifyPassword('senha', hash)).toBe(true);
    });

    it('treats equivalent unicode forms as the same password', async () => {
        const hash = await hashPassword('café');

        expect(await verifyPassword('café', hash)).toBe(true);
    });

    it.each([
        ['null', null],
        ['an empty string', ''],
        ['another algorithm', 'bcrypt$2b$10$abc'],
        ['non numeric cost', 'scrypt$x$8$1$c2FsdA==$aGFzaA=='],
    ])('returns false for %s as stored hash', async (_, stored) => {
        expect(await verifyPassword('senha', stored)).toBe(false);
    });
});
