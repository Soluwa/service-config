import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import {
  errorHandler,
  logger as logMid,
  serverStatus,
} from 'sc-caf-middleware';

import router from './api';
import { isAllowed } from './middleware';
import startupCheck from './startup-check';

export default () => {
  const swaggerDocument = YAML.load(`${__dirname}/swagger.yaml`);

  const started = new Date();
  const app = express();

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(cors());
  app.use(helmet());
  app.use(logMid());
  app.use(serverStatus(started));

  if (process.env.NODE_ENV !== 'production') {
    app.use(
      '/coverage',
      express.static(path.join(process.cwd(), 'coverage/lcov-report'))
    );
    app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/swagger', (req, res) => res.send(swaggerDocument));
  }

  startupCheck();
  app.use(isAllowed());
  app.use('/', router());

  app.use(errorHandler());
  return app;
};
