import urljoin from 'url-join';
import request from 'request-promise-native';

import constants from '../../constants';

const baseUrl = urljoin(constants.DB_URL, constants.DB_COLLECTION);

const designUriPart = urljoin('_design', constants.DESIGN_DOC);

export const connector = (uri, opts) =>
  request(uri, {
    baseUrl,
    auth: {
      user: constants.DB_USER,
      pass: constants.DB_PASSWORD,
    },
    json: true,
    ...opts,
  });

export const addBulk = docs =>
  connector('_bulk_docs', { method: 'POST', body: { docs } });

export const requestFind = selector =>
  connector('_find', { method: 'POST', body: { selector } });

export const requestView = (view, opts) =>
  connector(urljoin(designUriPart, '_view', view), opts);
