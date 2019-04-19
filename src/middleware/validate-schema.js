import Boom from 'boom';
import Ajv from 'ajv';

export default schemas => (req, res, next) => {
  const ajv = new Ajv({ schemas });
  const validate = ajv.getSchema();
  const isValid = validate(req.body);

  if (!isValid) {
    const messages = validate.errors.map(
      err =>
        `${err.message}, path: ${err.dataPath}.${Object.values(err.params).join(
          ','
        )}`
    );
    next(Boom.badRequest(messages.join('. ')));
  } else {
    next();
  }
};
