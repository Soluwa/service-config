/* eslint-disable import/first, one-var */
jest.mock('express', () => ({
  Router: jest.fn(() => ({
    use: jest.fn(),
  })),
}));

jest.mock('./config', () => ({ configRouter: jest.fn() }));
jest.mock('../middleware');

import router from './router';
import { decrypt } from '../middleware';

describe('api: router', () => {
  let result;
  process.env.CONFIG_PRIVATE_KEY = 'private';
  process.env.CONFIG_PASSPHRASE = 'pass';
  beforeEach(() => {
    result = router();
  });

  test('should return router object', () => {
    expect(typeof result).toBe('object');
    expect(result.use).toBeDefined();
  });

  test('should call router.use', () => {
    expect(result.use).toHaveBeenCalled();
    expect(result.use.mock.calls[0][0]).toBe('/product');
    expect(decrypt).toBeCalledWith('private', 'pass');
  });
});
