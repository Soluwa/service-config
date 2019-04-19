/* eslint-disable no-param-reassign */
const randomstring = require('randomstring');
const _ = require('lodash');
const variantConfigDoc = require('../api-steps/helpers/stubs/variantConfig');

const genConfigStep = that => (number, inProductId) => {
  const productId = inProductId || randomstring.generate(5);
  const watsonConfig = _.get(
    variantConfigDoc,
    'engines.watson-assistant.credentials.CBAAS-WATSON-ASSISTANT'
  );
  watsonConfig.password = randomstring.generate(12);
  const genVariant = () =>
    _.chain(
      _.extend({}, variantConfigDoc, {
        productId,
        variantId: randomstring.generate(5),
      })
    )
      .set(
        'engines.watson-assistant.credentials.CBAAS-WATSON-ASSISTANT',
        watsonConfig
      )
      .value();
  const array = Array(number);
  that.json = _.map(array, genVariant);
  that.productId = productId;
  return that;
};

module.exports = { genConfigStep };
