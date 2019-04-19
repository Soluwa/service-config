import _ from 'lodash';
import Boom from 'boom';
import * as db from '../../db/cloudant';

const addId = doc => ({ _id: `${doc.productId}:${doc.variantId}`, ...doc });

const rationaliseDocs = docs => (_.isArray(docs) ? docs : [docs]);

const rationaliseResponse = resps => (resps.length === 1 ? resps[0] : resps);

export const add = async docs => {
  const rationalisedDocs = rationaliseDocs(docs);
  if (_.find(rationalisedDocs, doc => doc._id || doc._rev))
    throw Boom.badRequest(
      'One or more posted documents includes _id or _rev. Use PUT to updated exisiting config.'
    );
  const docsWithIds = _.map(rationalisedDocs, addId);
  const resp = await db.addBulk(docsWithIds);
  if (resp.length === 1 && resp.error === 'conflict')
    throw Boom.badRequest('Could not post: conflict');
  else if (resp.length === 1 && resp.error)
    throw Boom.badRequest(`Error posting to DB: ${resp.reason}`);

  return rationaliseResponse(resp);
};

export const update = async (docs, upsert) => {
  const rationalisedDocs = rationaliseDocs(docs);
  if (!upsert && !_.every(rationalisedDocs, doc => _.isString(doc._rev)))
    throw Boom.badRequest(
      'Revision _rev missing from one or more updated documents. Use upsert=true to create new documents.'
    );
  const docsWithIds = _.map(rationalisedDocs, addId);
  return rationaliseResponse(await db.addBulk(docsWithIds));
};

const summarise = config => ({
  ..._.pick(config, ['productId', 'variantId', 'weight', 'schedule']),
  url: `/product/${config.productId}/${config.variantId}`,
});

const getVariantsSummary = (configs, withConfig) => ({
  productId: configs[0].productId,
  variants: _.map(configs, config => (withConfig ? config : summarise(config))),
});

export const getProductList = async () => {
  try {
    return { products: await db.getProductList() };
  } catch (e) {
    if (e.isBoom) throw e;
    throw Boom.badImplementation('Failed to get list of products', e);
  }
};

export const getProductDocs = async (productId, withDocs) => {
  try {
    const docs = await db.getProductDocs(productId);
    if (_.isEmpty(docs)) throw Boom.notFound(`Product ${productId} not found.`);
    return getVariantsSummary(docs, withDocs);
  } catch (e) {
    if (e.isBoom) throw e;
    throw Boom.badImplementation(
      `Failed to get config for productId ${productId}`,
      e
    );
  }
};

export const getConfigDoc = async (productId, variantId) => {
  try {
    return await db.getConfigDoc(productId, variantId);
  } catch (e) {
    if (e.isBoom) throw e;
    throw Boom.badImplementation(
      `Failed to get config document for productId ${productId}, variantId ${variantId}`,
      e
    );
  }
};
