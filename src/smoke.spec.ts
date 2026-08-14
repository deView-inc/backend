import { describe, expect, it } from 'vitest';

describe('smoke', () => {
    it('environment is node and vitest runs', () => {
        expect(typeof describe).toBe('function');
        expect(typeof process).not.toBe('undefined');
        expect(process.env['NODE_ENV']).toBe('test');
    });

    it('basic math sanity check', () => {
        expect(1 + 1).toBe(2);
    });
});
