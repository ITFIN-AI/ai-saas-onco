import * as functions from 'firebase-functions';
import { FirebaseApiTokensRepository } from 'shared/infra/repositories/FirebaseApiTokensRepository';
import express from 'express';
import bodyParser from 'body-parser';
import { requestLogger } from 'shared/infra/http/middleware/accessLogger';
import { apiAuthorizer } from 'shared/infra/http/middleware/apiAuthorizer';
import { rateLimiter } from 'shared/infra/http/middleware/rateLimiter';
import { ApiController } from 'shared/infra/http/ApiController';
import { ApiRoute } from 'modules/api/infra/routes/types';
import OpenApi from 'modules/api/docs/OpenApi';
import { DEFAULT_FIREBASE_REGION } from '@akademiasaas/shared';
import { env, db } from 'config';

const apiTokensRepository = new FirebaseApiTokensRepository({ db });
const app = express();

const register = (prefix: string, routes: ApiRoute[]) => {
  const router = express.Router();

  for (const route of routes) {
    const { method, path, handler } = route;

    router[method](path, async (req, res) => {
      await handler(req, res);
    });

    openApi.registerPath(prefix, route);
  }
  app.use(prefix, router);
};

app.use(bodyParser.json());
app.use(requestLogger);

const openApi = new OpenApi();
app.get('/api/v1/openapi.json', (req, res) => {
  res.json(openApi.getDocument());
});

app.use(apiAuthorizer(env.api.jwtPrivateKey, apiTokensRepository));
app.use(
  rateLimiter({
    logger: functions.logger,
    prefix: env.projectId,
    redis: env.redis,
    limit: 60,
    windowSeconds: 60,
  })
);

register('/api/v1/users', []);

app.use((req, res) => {
  if (!res.headersSent) {
    return ApiController.notFound(res);
  }
});

export const api = functions.region(DEFAULT_FIREBASE_REGION).https.onRequest(app);
export default api;
