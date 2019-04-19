import _ from 'lodash';
import Boom from 'boom';
import { requestFind, requestView } from './connector';
import constants from '../../constants';

export const getProductList = async () => {
  const res = await requestView(constants.VIEW_PRODUCT_LIST, {
    method: 'GET',
    qs: {
      reduce: true,
      group: true,
    },
  });

  const groupedByProduct = _.groupBy(res.rows, 'key[0]');
  return _.map(groupedByProduct, (rows, key) => ({
    productId: key,
    variants: _.map(rows, row => _.get(row, 'key[1]')),
  }));
};

export const getProductDocs = async productId => {
  const res = await requestFind({ productId });
  const docs = _.map(res.docs, d => d);
  return docs;
};

export const getConfigDoc = async (productId, variantId) => {
  const res = await requestFind({ productId, variantId });
  const docs = _.map(res.docs, d => d);
  if (docs.length === 0) throw Boom.notFound();
  if (docs.length > 1)
    throw Boom.badImplementation(
      `Duplicate config docs found for productId: ${productId}, variantId: ${variantId}`
    );
  return docs[0];
};
