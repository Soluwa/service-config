import db from 'cbaas-module-store';
import logger from 'sc-caf-module-logger';
import views from './views.json';

import defaultConfig from '../default-config.json';

export const ensureDatabase = () => {
  const defaults =
    process.env.NODE_ENV === 'development'
      ? [...views, ...defaultConfig]
      : views;
  return db.ensureDatabase(defaults);
};

(async () => {
  try {
    await ensureDatabase();
  } catch (e) {
    logger().error(`Error ensuring database ${e.stack}`);
    process.exit(1);
  }
})();
