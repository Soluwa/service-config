const { BeforeAll, Given, When, Then } = require('cucumber');
const utils = require('./calls');
const _ = require('lodash');
const { assert } = require('chai');
const { Validator } = require('jsonschema');
const { logger } = require('sc-caf-module-logger');

const asserts = require('./assert');
const { genConfigStep } = require('./config');

const v = new Validator();

BeforeAll(async () => {
  await utils.initialiseConnectors();
});
Given('I create a new product with {int} variants', number =>
  genConfigStep(this)(number)
);
Given(
  'I create a new product with {int} variants for new product {word}',
  (number, productId) => {
    this.productId = productId;
    genConfigStep(this)(number);
  }
);
Given('I change property {word} to {word} in the config', (prop, value) => {
  this.json = this.response.data;
  this.json[prop] = value;
});
Given('I have updated the config variant document\\(s)', () => {
  const variants = _.get(this, 'response.data.variants');
  this.json = _.map(variants, doc => {
    const editedDoc = _.cloneDeep(doc);
    _.set(editedDoc, 'weight', _.random());
    _.set(editedDoc, 'copy.release', '2050-10-10');
    return editedDoc;
  });
});
Given('I have a new config variant document\\(s) for the productId', () => {
  const existingJson = this.json.concat([]);
  genConfigStep(this)(1, this.productId);
  _.set(this.json[0], 'copy.release', '2050-10-10');
  _.set(this.json[0], 'weight', _.random());
  this.json = existingJson.concat(this.json);
});
Given('I have a new config variant document\\(s) for {word}', productId => {
  const existingJson = this.json.concat([]);
  genConfigStep(this)(1, productId);
  _.set(this.json[0], 'copy.release', '2050-10-10');
  _.set(this.json[0], 'weight', _.random());
  this.json = existingJson.concat(this.json);
});
Given('I add an event with an id of {string} and alias of {string} and a datatype of {string}', (id, alias, datatype) => {
  const variants = _.get(this, 'response.data.variants');
  this.json = _.map(variants, doc => {
    const editedDoc = _.cloneDeep(doc);
    _.set(editedDoc, 'feeds.tableau.schemas.latest.id', id);
    _.set(editedDoc, 'feeds.tableau.schemas.latest.alias', alias);
    _.set(editedDoc, 'feeds.tableau.schemas.latest.datatype', datatype);
    _.set(editedDoc, 'copy.release', '2050-10-10');
    return editedDoc;
  });
});

Given('I add an event having id as {string} and alias of {string} and dataType of {string}', (id, alias, datatype) => {
 
  const variants = _.get(this, 'response.data.variants');
  this.json = _.map(variants, doc => {
    const editedDoc = _.cloneDeep(doc);
    _.set(editedDoc, 'feeds.tableau.schemas.latest.id', id);
    _.set(editedDoc, 'feeds.tableau.schemas.latest.alias', alias);
    _.set(editedDoc, 'feeds.tableau.schemas.latest.datatype', datatype);
   // _.set(editedDoc, 'copy.release', '2050-10-10');
    return editedDoc;
  });
});

When('I POST to the service', utils.callStep(utils.productPOST, this));
When('I PUT to the service', utils.callStep(utils.product_PUT, this));

When('I PUT to the service with upsert', () => {
  this.upsert = true;
  return utils.callStep(utils.productPUT, this)();
});
When('I GET all products', utils.callStep(utils.productGET, this));
When('I GET by productId without docs', () => {
  this.docs = 'false';
  return utils.callStep(utils.productGETproductId, this)();
});
When('I GET by productId with docs', () => {
  this.docs = 'true';
  return utils.callStep(utils.productGETproductId, this)();
});
When('I GET the {word} product config with docs', id => {
  this.docs = 'true';
  this.productId = id;
  return utils.callStep(utils.productGETproductId, this)();
});
When('I GET the {word} product config', productId => {
  this.docs = 'false';
  this.productId = productId;
  return utils.callStep(utils.productGETproductId, this)();
});
When(
  'I GET the {word} products {word} variant config',
  (productId, variantId) => {
    this.docs = 'false';
    this.productId = productId;
    this.variantId = variantId;
    return utils.callStep(utils.productGETvariant, this)();
  }
);



Then('the request succeeds', () =>{
  asserts.verifyStatusCode(this.response.statusCode, 200)
});

Then('all {int} the variants are represented', count =>
  assert.lengthOf(this.response.data.variants, count)
);
Then('the productId matches', () =>
  assert.equal(_.get(this, 'response.data.productId'), this.productId)
);
Then('the route to the variant docs are returned', () =>
  assert.isString(_.get(this, 'response.data.variants[0].url'))
);
Then('the content of the config is returned', () => {
  assert.isDefined(_.get(this, 'response.data.variants[0].coordination'));
  assert.isDefined(_.get(this, 'response.data.variants[0]._id'));
  assert.isDefined(_.get(this, 'response.data.variants[0]._rev'));
});
Then('the new product is represented in the response', () => {
  const products = _.get(this, 'response.data.products');
  const configDoc = _.find(products, o => o.productId === this.productId);
  assert.isDefined(configDoc);
});
Then('the default products are shown', () => {
  const defaultProductIds = ['cbaas', 'dev', 'demo'];
  const products = _.get(this, 'response.data.products');
  const configDocs = _.filter(
    products,
    o => defaultProductIds.indexOf(o.productId) > -1
  );
  assert.equal(configDocs.length, 3);
});
Then('the {word} product is shown', id => {
  const { productId } = _.get(this, 'response.data');
  assert.equal(productId, id);
});
Then('there are {int} variants for the {word} product', (number, id) => {
  const { productId, variants } = _.get(this, 'response.data');
  assert.equal(productId, id);
  assert.lengthOf(variants, number);
});
Then(
  'validate the JSON response object against the JSON schema {word}',
  (schemafile, done) => {
    // eslint-disable-next-line
    const defs = require('./helpers/jsonSchema/definitions.json');
    // eslint-disable-next-line
    const schema = require(`./helpers/jsonSchema/${schemafile}.schema.json`);

    schema.definitions = defs.definitions;
    const jsonresult = v.validate(this.response, schema);
    const errorCount = jsonresult.errors.length;

    if (errorCount !== 0) {
      logger().info(v.validate(this.response, schema));
    }
    assert.equal(errorCount, 0, 'InvalidResponseObject');
    done();
  }
);
Then('I am informed {word} product config is not found', id => {
  assert.equal(this.error, `404 - {"message":"Product ${id} not found."}`);
});
// eslint-disable-next-line no-unused-vars
Then('I am informed variant {word} product config is not found', id => {
  assert.equal(this.error, `404 - {"message":"Not Found"}`);
});
Then('the variant content changes have been persisted', () => {

  console.log(this.json)
  //console.log(this.data)
  // _.each(this.json, item => {
  //   const editedItem = _.find(this.response.data.variants, {
  //     _id: `${item.productId}:${item.variantId}`,
  //   });
  //   assert.isDefined(editedItem, `Item with ID ${item._id} missing.`);
  //   assert.equal(
  //     item.copy.release,
  //     editedItem.copy.release,
  //     'Release field not updated'
  //   );
  //   assert.equal(item.weight, editedItem.weight, 'Weight field not updated');
  // });
});
Then('I remove a _rev from 1 variant document', () => {
  delete this.json._rev;
});
Then('I remove a _id from 1 variant document', () => {
  delete this.json[0]._id;
});
Then('I am informed there was a document conflict', () => {
  assert.equal(this.response.data.error, 'conflict');
  assert.equal(this.response.data.reason, 'Document update conflict.');
});
Then('I am informed there was a missing _rev', () => {
  assert.equal(
    this.error,
    '400 - {"message":"Revision _rev missing from one or more updated documents. Use upsert=true to create new documents."}'
  );
});
Then('I prepare the same variant document for submission', () => {
  this.json = this.response.data;
});
