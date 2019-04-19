/* eslint-disable import/first, one-var */
jest.mock('crypto');

import Boom from 'boom';
import crypto from 'crypto';
import * as crypt from './crypt';

describe('crypt', () => {
  describe('decryptValue', () => {
    test('returns decrypted value', () => {
      crypto.privateDecrypt.mockImplementation(() => 'decrypted value');
      expect(crypt.decryptValue('value', 'key', 'passphrase')).toEqual(
        'decrypted value'
      );
    });
  });

  describe('encryptValue', () => {
    test('returns encrypted value', () => {
      crypto.publicEncrypt.mockImplementation(() => 'encrypted value');
      expect(crypt.encryptValue('value', 'key')).toEqual('encrypted value');
    });
  });

  describe('mapValuesDeep', () => {
    test('applies transform to sesitive properties', () => {
      expect(
        crypt.mapValuesDeep(
          {
            the: [{ rain: 'in' }, { spain: { secret: 'ting' } }],
            password: 'secret',
          },
          value => `--${value}--`
        )
      ).toEqual({
        the: [{ rain: 'in' }, { spain: { secret: '--ting--' } }],
        password: '--secret--',
      });
    });
  });

  describe('encrypt', () => {
    test('skips if no public key input', () => {
      const next = jest.fn();
      const req = {
        body: { something: { secret: 'ting' }, password: 'donut' },
      };
      const middleware = crypt.encrypt();
      middleware(req, {}, next);
      expect(jest.spyOn(crypt, 'encryptValue')).not.toHaveBeenCalled();
      expect(req).toEqual({
        body: { something: { secret: 'ting' }, password: 'donut' },
      });
      expect(next).toBeCalled();
    });
    test('encrypts response body', () => {
      const next = jest.fn();
      const req = {
        body: { something: { secret: 'ting' }, password: 'donut' },
      };
      const middleware = crypt.encrypt('publicKey');
      jest.spyOn(crypt, 'encryptValue').mockImplementation(() => 'boo');
      middleware(req, {}, next);
      expect(req).toEqual({
        body: { something: { secret: 'boo' }, password: 'boo' },
      });
      expect(next).toBeCalled();
    });

    test('throws correct error if failure to encrpyt', () => {
      const next = jest.fn();
      const req = {
        body: { something: { secret: 'ting' }, password: 'donut' },
      };
      const middleware = crypt.encrypt('publicKey');
      jest.spyOn(crypt, 'encryptValue').mockImplementation(() => {
        throw Error('error');
      });
      middleware(req, {}, next);
      expect(req).toEqual({
        body: { something: { secret: 'ting' }, password: 'donut' },
      });
      expect(next).toBeCalledWith(
        Boom.boomify(Error(`Error encrypting config: error`), {
          statusCode: 500,
        })
      );
    });
  });

  describe('decrypt', () => {
    test('skips if no private key and passphrase', () => {
      const next = jest.fn();
      const res = {
        body: { something: { secret: 'ting' }, password: 'donut' },
      };
      const middleware = crypt.decrypt();
      middleware({}, res, next);
      expect(jest.spyOn(crypt, 'decryptValue')).not.toHaveBeenCalled();
      expect(res).toEqual({
        body: { something: { secret: 'ting' }, password: 'donut' },
      });
      expect(next).toBeCalled();
    });
    test('decrypts response body', () => {
      const next = jest.fn();
      const res = {
        body: { something: { secret: 'ting' }, password: 'donut' },
      };
      const middleware = crypt.decrypt('privateKey', 'passphrase');
      jest.spyOn(crypt, 'decryptValue').mockImplementation(() => 'boo');
      middleware({}, res, next);
      expect(res).toEqual({
        body: { something: { secret: 'boo' }, password: 'boo' },
      });
      expect(next).toBeCalled();
    });

    test('throws correct error if failure to decrypt', () => {
      const next = jest.fn();
      const res = {
        body: { something: { secret: 'ting' }, password: 'donut' },
      };
      const middleware = crypt.decrypt('privateKey', 'passphrase');
      jest.spyOn(crypt, 'decryptValue').mockImplementation(() => {
        throw Error('error');
      });
      middleware({}, res, next);
      expect(res).toEqual({
        body: { something: { secret: 'ting' }, password: 'donut' },
      });
      expect(next).toBeCalledWith(
        Boom.boomify(Error(`Error decrypting config: error`), {
          statusCode: 500,
        })
      );
    });
  });
});
