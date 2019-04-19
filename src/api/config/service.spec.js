/* eslint-disable import/first, one-var */
import * as service from './service';
import * as db from '../../db/cloudant';

jest.mock('../../db/cloudant', () => ({
  getProductList: jest.fn(),
  getProductDocs: jest.fn(),
  getConfigDoc: jest.fn(),
  addBulk: jest.fn(),
  requestFind: jest.fn(),
  requestView: jest.fn(),
}));

const configDoc = {
  _id: '123',
  _rev: '456',
  productId: 'prod',
  variantId: 'test',
  some: 'stuff',
};

beforeEach(jest.clearAllMocks);
describe('add', () => {
  test('creates single config', async () => {
    db.addBulk.mockImplementationOnce(() => [{ ok: true }]);
    expect(
      await service.add({ productId: 'prod', variantId: 'test', some: 'stuff' })
    ).toEqual({ ok: true });
    expect(db.addBulk).toBeCalledWith([
      {
        _id: 'prod:test',
        productId: 'prod',
        variantId: 'test',
        some: 'stuff',
      },
    ]);
  });
  test('creates multiple config', async () => {
    db.addBulk.mockImplementationOnce(() => [{ ok: true }, { ok: true }]);
    expect(
      await service.add([
        { productId: 'prod', variantId: 'test', some: 'stuff' },
        { productId: 'prod', variantId: 'dev', some: 'stuff' },
      ])
    ).toEqual([{ ok: true }, { ok: true }]);
    expect(db.addBulk).toBeCalledWith([
      {
        _id: 'prod:test',
        productId: 'prod',
        variantId: 'test',
        some: 'stuff',
      },
      {
        _id: 'prod:dev',
        productId: 'prod',
        variantId: 'dev',
        some: 'stuff',
      },
    ]);
  });
  test('throws if _id included in input docs', async () => {
    expect.assertions(2);
    try {
      await service.add([
        { _id: 'my_id', productId: 'prod', variantId: 'test', some: 'stuff' },
        { productId: 'prod', variantId: 'dev', some: 'stuff' },
      ]);
    } catch (e) {
      expect(e.message).toEqual(
        'One or more posted documents includes _id or _rev. Use PUT to updated exisiting config.'
      );
    }
    expect(db.addBulk).not.toBeCalled();
  });
  test('throws if _rev included in an input doc', async () => {
    expect.assertions(2);
    try {
      await service.add([
        { _rev: 'my_rev', productId: 'prod', variantId: 'test', some: 'stuff' },
      ]);
    } catch (e) {
      expect(e.message).toEqual(
        'One or more posted documents includes _id or _rev. Use PUT to updated exisiting config.'
      );
    }
    expect(db.addBulk).not.toBeCalled();
  });
});

describe('update', () => {
  test('updates single config', async () => {
    db.addBulk.mockImplementationOnce(() => [{ ok: true }]);
    expect(await service.update(configDoc)).toEqual({ ok: true });
    expect(db.addBulk).toBeCalledWith([configDoc]);
  });
  test('updates multiple configs', async () => {
    db.addBulk.mockImplementationOnce(() => [{ ok: true }, { ok: true }]);
    expect(
      await service.update([
        {
          _id: '123',
          _rev: '456',
          productId: 'prod',
          variantId: 'test',
          some: 'stuff',
        },
        {
          _id: '1234',
          _rev: '4567',
          productId: 'prod',
          variantId: 'dev',
          some: 'stuff',
        },
      ])
    ).toEqual([{ ok: true }, { ok: true }]);
    expect(db.addBulk).toBeCalledWith([
      {
        _id: '123',
        _rev: '456',
        productId: 'prod',
        variantId: 'test',
        some: 'stuff',
      },
      {
        _id: '1234',
        _rev: '4567',
        productId: 'prod',
        variantId: 'dev',
        some: 'stuff',
      },
    ]);
  });
  test('creates config if upsert', async () => {
    db.addBulk.mockImplementationOnce(() => [{ ok: true }]);
    expect(
      await service.update(
        {
          productId: 'prod',
          variantId: 'test',
          some: 'stuff',
        },
        true
      )
    ).toEqual({ ok: true });
    expect(db.addBulk).toBeCalledWith([
      {
        _id: 'prod:test',
        productId: 'prod',
        variantId: 'test',
        some: 'stuff',
      },
    ]);
  });
  test('throw error if _rev missig', async () => {
    expect.assertions(2);
    try {
      await service.update([
        { productId: 'prod', variantId: 'test', some: 'stuff' },
      ]);
    } catch (e) {
      expect(e.message).toEqual(
        'Revision _rev missing from one or more updated documents. Use upsert=true to create new documents.'
      );
    }
    expect(db.addBulk).not.toBeCalled();
  });
});

describe('getProductList', () => {
  test('good response', async () => {
    const dbResp = [{ productId: 'divr', variants: ['test', 'prod'] }];
    db.getProductList.mockImplementationOnce(() => dbResp);
    expect(await service.getProductList()).toEqual({ products: dbResp });
  });

  test('surfaces Boom errors', async () => {
    expect.assertions(1);
    const boomError = new Error();
    boomError.isBoom = true;
    db.getProductList.mockImplementationOnce(() => {
      throw boomError;
    });
    try {
      await service.getProductList();
    } catch (e) {
      expect(e).toBe(boomError);
    }
  });

  test('boomify bad implementations', async () => {
    expect.assertions(1);
    db.getProductList.mockImplementationOnce(() => {
      throw Error('oops');
    });
    try {
      await service.getProductList();
    } catch (e) {
      expect(e.message).toMatch('Failed to get list of products');
    }
  });
});

describe('getProductDocs', () => {
  const docs = [
    {
      _id: 'prod:test',
      _rev: '456',
      productId: 'prod',
      variantId: 'test',
      weight: 1,
      some: 'stuff',
    },
    {
      _id: 'prod:dev',
      _rev: '456',
      productId: 'prod',
      variantId: 'dev',
      weight: 0,
      some: 'stuff',
    },
  ];
  test('gets and transforms into summary', async () => {
    db.getProductDocs.mockImplementationOnce(() => docs);
    expect(await service.getProductDocs('prod')).toEqual({
      productId: 'prod',
      variants: [
        {
          productId: 'prod',
          variantId: 'test',
          weight: 1,
          url: '/product/prod/test',
        },
        {
          productId: 'prod',
          variantId: 'dev',
          weight: 0,
          url: '/product/prod/dev',
        },
      ],
    });
  });
  test('gets and transforms with full docs', async () => {
    db.getProductDocs.mockImplementationOnce(() => docs);
    expect(await service.getProductDocs('prod', true)).toEqual({
      productId: 'prod',
      variants: docs,
    });
  });
  test('not found error if query result is empty', async () => {
    expect.assertions(2);

    db.getProductDocs.mockImplementationOnce(() => []);
    try {
      await service.getProductDocs('swb');
    } catch (e) {
      expect(e.message).toBe('Product swb not found.');
      expect(e.output.statusCode).toBe(404);
    }
  });
  test('surfaces Boom errors', async () => {
    expect.assertions(1);
    const boomError = new Error();
    boomError.isBoom = true;
    db.getProductDocs.mockImplementationOnce(() => {
      throw boomError;
    });
    try {
      await service.getProductDocs('divr');
    } catch (e) {
      expect(e).toBe(boomError);
    }
  });

  test('boomify bad implementations', async () => {
    expect.assertions(1);
    db.getProductDocs.mockImplementationOnce(() => {
      throw Error('oops');
    });
    try {
      await service.getProductDocs('divr');
    } catch (e) {
      expect(e.message).toMatch('Failed to get config for productId divr');
    }
  });
});

describe('getConfigDoc', () => {
  test('good response', async () => {
    const dbResp = {
      _id: 'prod:test',
      _rev: '456',
      productId: 'prod',
      variantId: 'test',
      weight: 1,
      some: 'stuff',
    };
    db.getConfigDoc.mockImplementationOnce(() => dbResp);
    expect(await service.getConfigDoc('prod', 'test')).toEqual(dbResp);
  });

  test('surfaces Boom errors', async () => {
    expect.assertions(1);
    const boomError = new Error();
    boomError.isBoom = true;
    db.getConfigDoc.mockImplementationOnce(() => {
      throw boomError;
    });
    try {
      await service.getConfigDoc();
    } catch (e) {
      expect(e).toBe(boomError);
    }
  });

  test('boomify bad implementations', async () => {
    expect.assertions(1);
    db.getConfigDoc.mockImplementationOnce(() => {
      throw Error('oops');
    });
    try {
      await service.getConfigDoc('prod', 'test');
    } catch (e) {
      expect(e.message).toMatch(
        'Failed to get config document for productId prod, variantId test'
      );
    }
  });
});
