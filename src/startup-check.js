import Boom from 'boom';

export default () => {
  const {
    ALLOWED_KEYS,
    DB_COLLECTION,
    DB_URL,
    DB_USER,
    DB_PASSWORD,
    CONFIG_PASSPHRASE,
    CONFIG_PUBLIC_KEY,
    CONFIG_PRIVATE_KEY,
    MONGO_URL,
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_COLLECTION,
  } = process.env;

  if (
    !(
      ALLOWED_KEYS &&
      DB_COLLECTION &&
      DB_URL &&
      DB_USER &&
      DB_PASSWORD &&
      CONFIG_PASSPHRASE &&
      CONFIG_PUBLIC_KEY &&
      CONFIG_PRIVATE_KEY
    ) &&
    !(
      ALLOWED_KEYS &&
      CONFIG_PASSPHRASE &&
      CONFIG_PUBLIC_KEY &&
      CONFIG_PRIVATE_KEY &&
      MONGO_COLLECTION &&
      MONGO_URL &&
      MONGO_USER &&
      MONGO_PASSWORD
    )
  )
    throw Boom.badImplementation(`ALL of the following environment variables must be defined: 
      ALLOWED_KEYS,
      DB_COLLECTION,
      DB_URL,
      DB_USER,
      DB_PASSWORD,
      CONFIG_PASSPHRASE,  
      CONFIG_PUBLIC_KEY,  
      CONFIG_PRIVATE_KEY
    `);
};
