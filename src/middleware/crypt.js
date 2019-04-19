import crypto from 'crypto';
import Boom from 'boom';
import { isArray, isObject, map, mapValues, toString } from 'lodash';
import {
  decryptValue as decryptVal,
  encryptValue as encryptVal,
  mapValuesDeep as mapDeep,
} from './crypt';

// module handles encrypting and decrypting sensitive config properties. Public, private keys and passphrases are generated with openSSL using RSA protocol.

// encrypts properties only with 'secret' or 'password' in the property name
const SensitivePropMatch = /([Ss][Ee][Cc][Rr][Ee][Tt])|([Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd])/;

// decrypt string with private key and passphrase
export const decryptValue = (value, key, passphrase) => {
  const decrypted = crypto.privateDecrypt(
    { key, passphrase },
    Buffer.from(value, 'base64')
  );

  return decrypted.toString('utf8');
};

// decrypt string using public key
export const encryptValue = (value, key) =>
  crypto.publicEncrypt(key, Buffer.from(value)).toString('base64');

// resursive function to iterate through input array or object, encrpyting or decypting (based on iteratee) all properties matching senstivie prop regex
export const mapValuesDeep = (value, iteratee) => {
  if (isArray(value)) return map(value, v => mapValuesDeep(v, iteratee));

  if (isObject(value))
    return mapValues(value, (v, k) => {
      if (k.match(SensitivePropMatch) !== null) return iteratee(toString(v));

      return mapValuesDeep(v, iteratee);
    });

  return value;
};

// middleware to encrypt input config (or array of config items) in request body
export const encrypt = publicKey => (req, res, next) => {
  if (!publicKey) return next();
  if (req.body)
    try {
      req.body = mapDeep(req.body, value =>
        encryptVal(value, publicKey.replace(/\\n/g, '\n'))
      );
    } catch (err) {
      next(
        Boom.boomify(Error(`Error encrypting config: ${err.message}`), {
          statusCode: 500,
        })
      );
    }
  return next();
};

// middleware to decrypt output config (or array of config items) in response body
export const decrypt = (privateKey, passphrase) => (req, res, next) => {
  if (!(privateKey && passphrase)) return next();
  if (res.body)
    try {
      res.body = mapDeep(res.body, value =>
        decryptVal(value, privateKey.replace(/\\n/g, '\n'), passphrase)
      );
    } catch (err) {
      return next(
        Boom.boomify(Error(`Error decrypting config: ${err.message}`), {
          statusCode: 500,
        })
      );
    }

  return next();
};
