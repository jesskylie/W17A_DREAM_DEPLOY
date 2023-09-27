import { clear } from './other.js';


describe('testing clear', () => {
    test('returns empty data', () => {
      expect(clear()).toStrictEqual({});
    });
});

