describe('trust proxy', () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = originalEnv;
        jest.resetModules();
    });

    function loadApp(trustProxy) {
        jest.resetModules();
        process.env = { ...originalEnv };

        if (trustProxy === undefined)
            delete process.env.TRUST_PROXY;
        else
            process.env.TRUST_PROXY = trustProxy;

        const app = require('../../src/app');
        require('../../src/database/connection').destroy();

        return app;
    }

    it('is disabled by default', () => {
        expect(loadApp().get('trust proxy')).toBe(false);
    });

    it('accepts the number of proxy hops', () => {
        expect(loadApp('1').get('trust proxy')).toBe(1);
    });
});
