/* eslint-disable no-underscore-dangle, no-param-reassign, no-extend-native, no-shadow, func-names, */

const request = require('request-promise-native');
const { getServiceKeys } = require('./cloudfoundry');
const urljoin = require('url-join');
const _ = require('lodash');

const {
  CF_SPACE = 'CBAAS-TEST-COMP',
  CF_ORG = 'POC21_CognitiveComputing',
  APP_NAME,
  SERVICE_URL,
  API_KEY,
  API_SECRET,
  CF_USERPASS,
} = process.env;

let appName;
let baseUrl;
let apiKey;
let apiSecret;
const initialiseConnectors = async () => {
  if (APP_NAME) appName = APP_NAME;
  else appName = `sc-caf-service-config-${CF_SPACE.toLowerCase()}`;

  if (SERVICE_URL) baseUrl = SERVICE_URL;
  else baseUrl = `https://${appName}.lbg.eu-gb.mybluemix.net/`;

  if (API_KEY && API_SECRET) {
    apiKey = API_KEY;
    apiSecret = API_SECRET;
  } else
    ({ key: apiKey, secret: apiSecret } = await getServiceKeys(
      CF_USERPASS,
      appName,
      CF_SPACE,
      CF_ORG
    ));
};

const includeHeaders = (body, response) => ({
  statusCode: response.statusCode,
  data: body,
});

const requestConfigService = (uri, opts) =>
  request(uri, {
    baseUrl,
    json: true,
    transform: includeHeaders,
    headers: {
      'Content-Type': 'application/json',
      'x-caf-api-key': apiKey,
      'x-caf-api-secret': apiSecret,
    },
    ...opts,
  });

const productPOST = ({ json }) =>
  requestConfigService('product', { method: 'POST', json });

const productPUT = ({ json, upsert = true }) =>
  requestConfigService('product', {
    method: 'PUT',
    json,
    qs: { upsert },
  });

  const product_PUT = ({ json, upsert = true }) =>
  requestConfigService('product', {
    method: 'PUT',
    json,
    qs: { upsert },
  });

const productGET = () => requestConfigService('product', { method: 'GET' });

const productGETproductId = ({ productId, docs }) =>
  requestConfigService(urljoin('product', productId), {
    method: 'GET',
    qs: { docs },
  });

const productGETvariant = ({ productId, variantId }) =>
  requestConfigService(urljoin('product', productId, variantId), {
    method: 'GET',
  });

const callStep = (call, that) => async () => {
  delete that.response;
  delete that.error;
  let response;
  try {
    response = await call(that);
  } catch (e) {
    return _.assign(that, { error: e.message, statusCode: e.statusCode });
  }
  return _.assign(that, { response });
};

module.exports = {
  initialiseConnectors,
  productPOST,
  productPUT,
  productGET,
  productGETproductId,
  productGETvariant,
  callStep,
  product_PUT
};
