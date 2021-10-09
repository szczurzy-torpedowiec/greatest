import { FastifyInstance } from 'fastify';
import { registerAPITokens } from './api/api-tokens';
import { DbManager } from '../database/database';
import registerSwagger from './register-swagger';
import { registerUserInfo } from './api/user-info';

export interface ApiPluginOptions {
  dbManager: DbManager;
}
export async function ApiPlugin(apiInstance: FastifyInstance, { dbManager }: ApiPluginOptions) {
  registerSwagger(apiInstance);
  registerAPITokens(apiInstance, dbManager);
  registerUserInfo(apiInstance, dbManager);

  apiInstance.ready()
    .then(
      () => { apiInstance.swagger(); },
      apiInstance.log.error,
    );
}
