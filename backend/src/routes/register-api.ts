import { FastifyInstance } from 'fastify';
import { registerAPITokens } from './api/api-tokens';
import { DbManager } from '../database/database';
import registerSwagger from './register-swagger';
import { registerUserInfo } from './api/user-info';
import { registerQuestionSets } from './api/question-sets';
import { registerTests } from './api/tests';
import { WebsocketPlugin } from './api/websocket';
import { registerSheets } from './api/sheets';
import { getWebsocketBus } from '../websocket-bus';
import { registerScans } from './api/scans';
import { registerPrint } from './api/print';
import { registerQr } from './api/qr';

export interface ApiPluginOptions {
  dbManager: DbManager;
}
export async function ApiPlugin(apiInstance: FastifyInstance, { dbManager }: ApiPluginOptions) {
  const websocketBus = getWebsocketBus();
  registerSwagger(apiInstance);
  registerAPITokens(apiInstance, dbManager);
  registerUserInfo(apiInstance, dbManager);
  registerQuestionSets(apiInstance, dbManager);
  registerTests(apiInstance, dbManager);
  registerSheets(apiInstance, dbManager, websocketBus);
  registerScans(apiInstance, dbManager, websocketBus);
  apiInstance.register(WebsocketPlugin, { dbManager, websocketBus, prefix: '/ws' });
  registerPrint(apiInstance, dbManager);
  registerQr(apiInstance);

  apiInstance.ready()
    .then(
      () => { apiInstance.swagger(); },
      apiInstance.log.error,
    );
}
