import { FastifyInstance } from 'fastify';
import { registerAPITokens } from './api/api-tokens';
import { DbManager } from '../database/database';
import registerSwagger from './register-swagger';
import { registerUserInfo } from './api/user-info';
import { registerQuestionSets } from './api/question-sets';
import { registerTests } from './api/tests';
import { WebsocketPlugin } from './api/websocket';

export interface ApiPluginOptions {
  dbManager: DbManager;
}
export async function ApiPlugin(apiInstance: FastifyInstance, { dbManager }: ApiPluginOptions) {
  registerSwagger(apiInstance);
  registerAPITokens(apiInstance, dbManager);
  registerUserInfo(apiInstance, dbManager);
  registerQuestionSets(apiInstance, dbManager);
  registerTests(apiInstance, dbManager);
  apiInstance.register(WebsocketPlugin, { dbManager, prefix: '/ws' });

  apiInstance.ready()
    .then(
      () => { apiInstance.swagger(); },
      apiInstance.log.error,
    );
}
