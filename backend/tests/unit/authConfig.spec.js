describe('auth config', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    const loadConfig = () => require('../../src/config/auth');

    it('uses JWT_SECRET from the environment', () => {
        process.env.JWT_SECRET = 'a'.repeat(32);

        expect(loadConfig().secret).toBe('a'.repeat(32));
    });

    it('pins the signing algorithm to HS256', () => {
        expect(loadConfig().algorithm).toBe('HS256');
    });

    it('defaults the token expiration to one day', () => {
        delete process.env.JWT_EXPIRES_IN;

        expect(loadConfig().expiresIn).toBe('1d');
    });

    it('reads a numeric JWT_EXPIRES_IN as seconds', () => {
        process.env.JWT_EXPIRES_IN = '3600';

        expect(loadConfig().expiresIn).toBe(3600);
    });

    it('keeps JWT_EXPIRES_IN with units as is', () => {
        process.env.JWT_EXPIRES_IN = '2h';

        expect(loadConfig().expiresIn).toBe('2h');
    });

    it('throws outside tests when JWT_SECRET is missing', () => {
        delete process.env.JWT_SECRET;
        process.env.NODE_ENV = 'production';

        expect(loadConfig).toThrow(/JWT_SECRET/);
    });

    it('throws outside tests when JWT_SECRET is too short', () => {
        process.env.JWT_SECRET = 'short';
        process.env.NODE_ENV = 'development';

        expect(loadConfig).toThrow(/at least 32 characters/);
    });
});
