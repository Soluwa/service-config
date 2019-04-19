import { Router } from 'express';
import { configRouter } from './config';
import { decrypt } from '../middleware';

export default () => {
  const {
    CONFIG_PRIVATE_KEY: privateKey,
    CONFIG_PASSPHRASE: passphrase,
  } = process.env;

  const router = Router();

  router.use(
    '/product',
    configRouter(),
    decrypt(privateKey, passphrase),
    (req, res) => res.send(res.body)
  );

  return router;
};
