/* eslint-disable import/first, one-var */
jest.mock('express');
jest.mock('../../middleware');
jest.mock('./service', () => ({
  add: jest.fn(),
  update: jest.fn(),
  getConfigDoc: jest.fn(),
  getProductDocs: jest.fn(),
  getProductList: jest.fn(),
}));

import * as service from './service';
import configRouter from './router';
import * as schemas from './schemas';
import * as mid from '../../middleware';

process.env.CONFIG_PRIVATE_KEY = 'privateKey';
process.env.CONFIG_PUBLIC_KEY = 'publicKey';
process.env.CONFIG_PASSPHRASE = 'passphrase';
process.env.DB_COLLECTION = 'database';

describe('config router', () => {
  let router, handler, req, res, next;
  beforeEach(() => {
    res = { send: jest.fn(), set: jest.fn() };
    next = jest.fn();

    router = configRouter();
  });

  afterEach(() => jest.clearAllMocks());

  describe('POST to /', () => {
    beforeEach(() => {
      [[, , , handler]] = router.post.mock.calls;
    });

    describe('when making a valid request', () => {
      beforeEach(async () => {
        req = { body: { meh: 'bleh' }, query: { target: 'mydb' } };
        service.add.mockImplementation(() =>
          Promise.resolve({ some: 'config' })
        );
        await handler(req, res, next);
      });

      test('it should validate the request body using the config schema', () =>
        expect(mid.validate.mock.calls[0][0]).toEqual([
          schemas.config,
          schemas.configMulti,
        ]));

      test('it should encrypt if public key is provided', () =>
        expect(mid.encrypt.mock.calls[0][0]).toEqual('publicKey'));

      test('it should pass the request body to the create function', () =>
        expect(service.add).toBeCalledWith({ meh: 'bleh' }));

      test('it should return the created config to the client', () => {
        expect(next).toBeCalled();
      });
    });

    describe('when an error occurs', () => {
      beforeEach(async () => {
        service.add.mockImplementation(() => Promise.reject(Error('whoopsie')));
        await handler(req, {}, next);
      });

      test('it should pass the error to next', () =>
        expect(next).toBeCalledWith(Error('whoopsie')));
    });
  });

  describe('PUT to /', () => {
    beforeEach(() => {
      [[, , , handler]] = router.put.mock.calls;
    });

    describe('when making a valid request', () => {
      beforeEach(async () => {
        req = { body: { meh: 'bleh' }, query: { upsert: 'true' } };
        service.update.mockImplementation(() =>
          Promise.resolve({ some: 'config' })
        );
        await handler(req, res, next);
      });

      test('it should validate the request body using the config schema', () =>
        expect(mid.validate.mock.calls[0][0]).toEqual([
          schemas.config,
          schemas.configMulti,
        ]));

      test('it should encrypt if public key is provided', () =>
        expect(mid.encrypt.mock.calls[0][0]).toEqual('publicKey'));

      test('it should pass the request body to the create function', () =>
        expect(service.update).toBeCalledWith({ meh: 'bleh' }, true));

      test('it should return the created config to the client', () => {
        expect(next).toBeCalled();
      });
    });

    describe('when an error occurs', () => {
      beforeEach(async () => {
        service.update.mockImplementation(() =>
          Promise.reject(Error('whoopsie'))
        );
        await handler(req, {}, next);
      });

      test('it should pass the error to next', () =>
        expect(next).toBeCalledWith(Error('whoopsie')));
    });
  });

  describe('GET to /:productId/:variantId', () => {
    beforeEach(() => {
      [[, handler]] = router.get.mock.calls;
    });

    describe('when making a valid request', () => {
      beforeEach(async () => {
        req = { params: { productId: 'cbaas', variantId: 'author' } };
        service.getConfigDoc.mockImplementation(() =>
          Promise.resolve({ some: 'config' })
        );
        await handler(req, res, next);
      });

      test('it should return the created config to the client', () => {
        expect(next).toBeCalled();
        expect(res.body).toEqual({ some: 'config' });
      });
    });

    describe('when an error occurs', () => {
      beforeEach(async () => {
        service.getConfigDoc.mockImplementation(() =>
          Promise.reject(Error('whoopsie'))
        );
        await handler(req, {}, next);
      });

      test('it should pass the error to next', () =>
        expect(next).toBeCalledWith(Error('whoopsie')));
    });
  });

  describe('GET to /:productId', () => {
    beforeEach(() => {
      [, [, handler]] = router.get.mock.calls;
    });

    describe('when making a valid request', () => {
      beforeEach(async () => {
        req = { params: { productId: 'cbaas' }, query: { docs: 'true' } };
        service.getProductDocs.mockImplementation(() =>
          Promise.resolve({ some: 'config' })
        );
        await handler(req, res, next);
      });

      test('it should return the created config to the client', () => {
        expect(next).toBeCalled();
        expect(res.body).toEqual({ some: 'config' });
      });
    });

    describe('when an error occurs', () => {
      beforeEach(async () => {
        service.getProductDocs.mockImplementation(() =>
          Promise.reject(Error('whoopsie'))
        );
        await handler(req, {}, next);
      });

      test('it should pass the error to next', () =>
        expect(next).toBeCalledWith(Error('whoopsie')));
    });
  });

  describe('GET to /', () => {
    beforeEach(() => {
      [, , [, handler]] = router.get.mock.calls;
    });

    describe('when making a valid request', () => {
      beforeEach(async () => {
        service.getProductList.mockImplementation(() =>
          Promise.resolve({ some: 'config' })
        );
        await handler(req, res, next);
      });

      test('it should return the created config to the client', () => {
        expect(res.send).toBeCalledWith({ some: 'config' });
      });
    });

    describe('when an error occurs', () => {
      beforeEach(async () => {
        service.getProductList.mockImplementation(() =>
          Promise.reject(Error('whoopsie'))
        );
        await handler(req, {}, next);
      });

      test('it should pass the error to next', () =>
        expect(next).toBeCalledWith(Error('whoopsie')));
    });
  });
});
