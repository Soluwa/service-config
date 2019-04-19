import * as cloudant from './cloudant';
import { requestFind, requestView } from './connector';

jest.mock('./connector', () => ({
  requestFind: jest.fn(),
  requestView: jest.fn(),
}));
jest.mock('../../constants', () => ({
  VIEW_PRODUCT_LIST: 'products',
}));

beforeEach(jest.resetAllMocks);
describe('getProductList', () => {
  test('Maps response from view appropriately', async () => {
    const viewResponse = {
      total_rows: 3,
      offset: 0,
      rows: [
        { id: 'divr:author', key: ['divr', 'author'], value: 1 },

        { id: 'divr:new', key: ['divr', 'new'], value: 1 },

        { id: 'fraud:default', key: ['fraud', 'default'], value: 1 },
      ],
    };
    requestView.mockReturnValue(viewResponse);
    expect(await cloudant.getProductList()).toEqual([
      {
        productId: 'divr',
        variants: ['author', 'new'],
      },
      {
        productId: 'fraud',
        variants: ['default'],
      },
    ]);
    expect(requestView).toBeCalledWith('products', {
      method: 'GET',
      qs: { reduce: true, group: true },
    });
  });

  test('Handles empty view', async () => {
    const viewResponse = { total_rows: 0, offset: 0, rows: [] };
    requestView.mockReturnValue(viewResponse);
    expect(await cloudant.getProductList()).toEqual([]);
  });
});

describe('getProductDocs', () => {
  test('sends a find to the db and maps response', async () => {
    requestFind.mockReturnValue({ docs: [{ doc: '1' }, { doc: '2' }] });
    expect(await cloudant.getProductDocs('divr')).toEqual([
      { doc: '1' },
      { doc: '2' },
    ]);
    expect(requestFind).toBeCalledWith({ productId: 'divr' });
  });
});

describe('getConfigDoc', () => {
  test('Not found', async () => {
    expect.assertions(1);
    requestFind.mockReturnValue({ docs: [] });
    try {
      await cloudant.getConfigDoc();
    } catch (e) {
      expect(e.output.statusCode).toBe(404);
    }
  });
  test('Database integrity error', async () => {
    expect.assertions(2);
    requestFind.mockReturnValue({ docs: [{ doc: 1 }, { doc: 2 }] });
    try {
      await cloudant.getConfigDoc('divr', 'author');
    } catch (e) {
      expect(e.output.statusCode).toBe(500);
      expect(e.message).toEqual(
        'Duplicate config docs found for productId: divr, variantId: author'
      );
    }
  });
  test('Happy path', async () => {
    requestFind.mockReturnValue({ docs: [{ doc: 1 }] });

    expect(await cloudant.getConfigDoc('divr', 'author')).toEqual({ doc: 1 });
    expect(requestFind).toBeCalledWith({
      productId: 'divr',
      variantId: 'author',
    });
  });
});
