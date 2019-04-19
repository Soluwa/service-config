import { Router } from 'express';
import * as service from './service';
import * as mid from '../../middleware';
import * as schemas from './schemas';

export default () => {
  const router = Router();
  const { CONFIG_PUBLIC_KEY: publicKey } = process.env;

  // post new config to a database, either single or array of config objects
  router.post(
    '/',
    mid.validate([schemas.config, schemas.configMulti]),
    mid.encrypt(publicKey),
    async (req, res, next) => {
      try {
        res.body = await service.add(req.body);
        next();
      } catch (err) {
        next(err);
      }
    }
  );

  // update existing configs
  router.put(
    '/',
    mid.validate([schemas.config, schemas.configMulti]),
    mid.encrypt(publicKey),
    async (req, res, next) => {
      try {
        const upsert = req.query.upsert === 'true' || false;
        res.body = await service.update(req.body, upsert);
        next();
      } catch (err) {
        next(err);
      }
    }
  );

  router.get('/:productId/:variantId', async (req, res, next) => {
    const { productId, variantId } = req.params;
    try {
      res.body = await service.getConfigDoc(productId, variantId);
      next();
    } catch (e) {
      next(e);
    }
  });

  router.get('/:productId', async (req, res, next) => {
    const { productId } = req.params;
    const withDocs = req.query.docs === 'true' || false;
    try {
      res.body = await service.getProductDocs(productId, withDocs);
      next();
    } catch (e) {
      next(e);
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      res.send(await service.getProductList());
    } catch (e) {
      next(e);
    }
  });

  return router;
};
