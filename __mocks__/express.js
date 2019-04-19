const Router = () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
});

const express = () => ({
  use: jest.fn(),
});

express.Router = Router;
express.static = jest.fn()

module.exports = express