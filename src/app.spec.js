/* eslint-disable import/first, one-var */
jest.mock('express');
jest.mock('./api', () => jest.fn());
jest.mock('swagger-ui-express', () => ({ serve: jest.fn(), setup: jest.fn() }));
jest.mock('yamljs');
jest.mock('./startup-check');

import express from 'express';
import app from './app';

describe('app', () => {
  let result;
  describe('when NODE_ENV is not production', () => {
    beforeEach(() => {
      express.static = jest.fn();
      result = app();
    });

    test('should initialise middleware', () => {
      expect(result.use).toHaveBeenCalled();
    });

    test('should call express.static', () => {
      expect(express.static).toHaveBeenCalled();
    });
  });

  describe('when NODE_ENV is production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      express.static = jest.fn();
      result = app();
    });

    test('should initialise middleware', () => {
      expect(result.use).toHaveBeenCalled();
    });

    test('should not call express.static', () => {
      expect(express.static).not.toHaveBeenCalled();
    });
  });
});
