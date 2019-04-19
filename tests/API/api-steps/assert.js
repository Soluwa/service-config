const { assert } = require('chai');

const responseStatusCode = inResponseStatusCode =>
  assert.equal(this.response.statusCode, inResponseStatusCode);

const verifyStatusCode = (actual, expected) => assert.equal(actual, expected);

const verifyErrorResponse = (actual, expected) =>
  assert.match(actual, expected);

const verifyIsDefined = expected => assert.isDefined(expected);

const verifyIsNotDefined = expected => assert.isUndefined(expected);

const verifyIsNotEmpty = expected => assert.isNotEmpty(expected);

const verifyIsEmpty = expected => assert.isEmpty(expected);

const verifyConfigId = (actual, expected) => assert.equal(actual, expected);

const verifyIsIncluded = (expected, message) =>
  assert.include(expected, message);

const verifyArray = expected => assert.isArray(expected);

module.exports = {
  responseStatusCode,
  verifyErrorResponse,
  verifyStatusCode,
  verifyIsDefined,
  verifyIsNotDefined,
  verifyIsNotEmpty,
  verifyIsEmpty,
  verifyIsIncluded,
  verifyArray,
  verifyConfigId,
};
