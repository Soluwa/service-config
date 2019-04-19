import jwt from 'jsonwebtoken';
import Boom from 'boom';
import _ from 'lodash';

export const validateToken = (bearerToken, secret) => {
  if (!secret) {
    throw Boom.badImplementation('Jwt secret missing.');
  }
  const token = bearerToken
    ? (bearerToken.trim().split('Bearer ')[1] || '').trim()
    : null;
  if (!token) {
    throw Boom.unauthorized('Authorization bearer token required.');
  }
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (err) {
    throw Boom.unauthorized('Bad authorization token.');
  }
};

export const isAllowed = () => (req, res, next) => {
  const { TOKEN_SECRET, ALLOWED_KEYS } = process.env;
  const authorization = req.get('authorization');
  const key = req.get('x-caf-api-key');
  const secret = req.get('x-caf-api-secret');
  if (key && secret) {
    const allowedKeys = JSON.parse(ALLOWED_KEYS);
    const allowed = _.find(allowedKeys, { key, secret });
    if (allowed) return next();
  } else if (authorization && TOKEN_SECRET) {
    validateToken(authorization, TOKEN_SECRET);
    return next();
  }
  throw Boom.unauthorized();
};

export default {
  isAllowed,
  validateToken,
};
