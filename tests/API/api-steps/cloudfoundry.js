const cf = require('cloud-foundry-client').default;
const _ = require('lodash');

const authenticate = async userpass => {
  const [user, pass] = _.split(userpass, ':');
  const { token } = await cf.login(user, pass);
  return token;
};

const getPropFromThing = async (auth, url, method, name, prop) => {
  const list = await method(auth, url);
  const thisThing = _.find(list, { name });
  if (!thisThing)
    throw Error(`Property not found: name: ${name}, prop: ${prop}`);
  return thisThing[prop];
};

const getSpacesUrl = (auth, org) =>
  getPropFromThing(auth, null, cf.getOrganizations, org, 'spaces_url');

const getServicesUrl = (auth, spacesUrl, space) =>
  getPropFromThing(
    auth,
    spacesUrl,
    cf.getSpaces,
    space,
    'service_instances_url'
  );

const getServiceKeysUrl = (auth, servicesUrl, service) =>
  getPropFromThing(
    auth,
    servicesUrl,
    cf.getServices,
    service,
    'service_keys_url'
  );

const getAppsUrl = (auth, spacesUrl, space) =>
  getPropFromThing(auth, spacesUrl, cf.getSpaces, space, 'apps_url');

const getAppEnv = (auth, appsUrl, app) =>
  getPropFromThing(auth, appsUrl, cf.getApps, app, 'envs');

const getCred = async (auth, serviceKeysUrl) => {
  const serviceKeys = await cf.getServiceKeys(auth, serviceKeysUrl);
  if (!serviceKeys) throw Error('Failed to get service keys');
  return serviceKeys.url;
};

const getServiceUrl = async (
  userpass,
  service,
  space = 'CAF-DEV-CI',
  org = 'POC21_CognitiveComputing'
) => {
  const token = await authenticate(userpass);

  const spacesUrl = await getSpacesUrl(token, org);
  const servicesUrl = await getServicesUrl(token, spacesUrl, space);
  const serviceKeysUrl = await getServiceKeysUrl(token, servicesUrl, service);
  const url = await getCred(token, serviceKeysUrl);
  return url;
};

const chooseKeys = envVars => {
  let allowedKeys;
  try {
    allowedKeys = JSON.parse(envVars.ALLOWED_KEYS);
  } catch (e) {
    throw Error('ALLOWED_KEYS missing or not a valid JSON');
  }
  const cbaasKey = _.find(allowedKeys, { key: 'cbaas' });
  if (!cbaasKey) throw Error('No key for "cbaas" in the environment.');
  return cbaasKey;
};

const getServiceKeys = async (
  userpass,
  app,
  space = 'CAF-DEV-CI',
  org = 'POC21_CognitiveComputing'
) => {
  const token = await authenticate(userpass);
  const spacesUrl = await getSpacesUrl(token, org);
  const appsUrl = await getAppsUrl(token, spacesUrl, space);
  const env = await getAppEnv(token, appsUrl, app);
  return chooseKeys(env);
};

module.exports = { getServiceUrl, getServiceKeys };
