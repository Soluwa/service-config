import jwt from 'jsonwebtoken';
import * as auth from './auth';

jest.mock('jsonwebtoken');

process.env.ALLOWED_KEYS = JSON.stringify([{ key: 'key', secret: 'secret' }]);
beforeEach(() => {
  delete process.env.TOKEN_SECRET;
});
test('authorise api keys', () => {
  const req = {
    get: header => {
      if (header === 'x-caf-api-key') return 'key';
      if (header === 'x-caf-api-secret') return 'secret';
      return undefined;
    },
  };
  const next = jest.fn();
  auth.isAllowed()(req, null, next);
  expect(next).toBeCalled();
});

test('authorise jwt', () => {
  process.env.TOKEN_SECRET = 'SECRET';
  const req = {
    get: header => {
      if (header === 'authorization') return 'Bearer token';
      return undefined;
    },
  };
  const next = jest.fn();
  auth.isAllowed()(req, null, next);
  expect(next).toBeCalled();
});

test('throw for bad keys', () => {
  expect.assertions(1);
  const req = {
    get: header => {
      if (header === 'x-caf-api-key') return 'key';
      if (header === 'x-caf-api-secret') return 'bird';
      return undefined;
    },
  };
  const next = jest.fn();
  try {
    auth.isAllowed()(req, null, next);
  } catch (e) {
    expect(e.output.statusCode).toBe(401);
  }
});

test('throw for bad auth header', () => {
  process.env.TOKEN_SECRET = 'SECRET';
  const req = {
    get: header => {
      if (header === 'authorization') return 'Beartoken';
      return undefined;
    },
  };
  const next = jest.fn();
  try {
    auth.isAllowed()(req, null, next);
  } catch (e) {
    expect(e.output.statusCode).toBe(401);
    expect(e.message).toBe('Authorization bearer token required.');
  }
});

test('throw for invalid token', () => {
  process.env.TOKEN_SECRET = 'SECRET';
  const req = {
    get: header => {
      if (header === 'authorization') return 'Bearer token';
      return undefined;
    },
  };
  jwt.verify.mockImplementationOnce(() => {
    throw Error('errrr');
  });
  const next = jest.fn();
  try {
    auth.isAllowed()(req, null, next);
  } catch (e) {
    expect(e.output.statusCode).toBe(401);
    expect(e.message).toBe('Bad authorization token.');
  }
});
