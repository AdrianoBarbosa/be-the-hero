const generateUniqueId = require('../../src/utils/generateUniqueId');

describe('generateUniqueId', () => {
    it('generates an 8 character hexadecimal id', () => {
        expect(generateUniqueId()).toMatch(/^[0-9a-f]{8}$/);
    });

    it('generates different ids on each call', () => {
        const ids = new Set(Array.from({ length: 100 }, generateUniqueId));

        expect(ids.size).toBe(100);
    });
});
