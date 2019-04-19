import request from 'request-promise-native';
import { connector, requestView, addBulk, requestFind } from './connector';

jest.mock('request-promise-native');
jest.mock('../../constants', () => ({
  DB_URL: 'db.url',
  DB_COLLECTION: 'cbaas-product',
  DESIGN_DOC: 'design',
  DB_USER: 'user',
  DB_PASSWORD: 'pass',
}));

beforeEach(jest.resetAllMocks);

describe('Request wrapper', () => {
  test('fills in boilerplate for all cloudant requests', async () => {
    await connector('uri', { foo: 'bar' });
    expect(request).toBeCalledWith('uri', {
      baseUrl: 'db.url/cbaas-product',
      auth: {
        user: 'user',
        pass: 'pass',
      },
      json: true,
      foo: 'bar',
    });
  });
});

describe('Function to request against a view', () => {
  test('fills in boilerplate for a request against a view', async () => {
    await requestView('view', { foo: 'bar' });
    expect(request).toBeCalledWith('_design/design/_view/view', {
      baseUrl: 'db.url/cbaas-product',
      auth: {
        user: 'user',
        pass: 'pass',
      },
      json: true,
      foo: 'bar',
    });
  });
});

describe('Function to bulk add documents', () => {
  test('posts the documents', async () => {
    await addBulk([{ foo: 'bar' }]);
    expect(request).toBeCalledWith('_bulk_docs', {
      baseUrl: 'db.url/cbaas-product',
      auth: {
        user: 'user',
        pass: 'pass',
      },
      json: true,
      method: 'POST',
      body: { docs: [{ foo: 'bar' }] },
    });
  });
});

describe('Function to query documents', () => {
  test('posts the query', async () => {
    await requestFind({ foo: 'bar' });
    expect(request).toBeCalledWith('_find', {
      baseUrl: 'db.url/cbaas-product',
      auth: {
        user: 'user',
        pass: 'pass',
      },
      json: true,
      method: 'POST',
      body: { selector: { foo: 'bar' } },
    });
  });
});
