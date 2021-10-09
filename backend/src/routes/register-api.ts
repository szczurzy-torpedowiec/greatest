import { FastifyInstance } from 'fastify';
import registerFolders from './api/folders';
import { registerAPITokens } from './api/api-tokens';
import { registerImageUpload } from './api/image-upload';
import { registerImageDownload } from './api/get-image';
import { DbManager } from '../database/database';
import registerSwagger from './register-swagger';
import { registerRules } from './api/rules';
import { registerUserInfo } from './api/user-info';

export interface ApiPluginOptions {
  dbManager: DbManager;
}
export async function ApiPlugin(apiInstance: FastifyInstance, { dbManager }: ApiPluginOptions) {
  registerSwagger(apiInstance);
  registerAPITokens(apiInstance, dbManager);
  registerUserInfo(apiInstance, dbManager);
  registerFolders(apiInstance, dbManager);
  registerImageUpload(apiInstance, dbManager);
  registerImageDownload(apiInstance, dbManager);
  registerRules(apiInstance, dbManager);

  apiInstance.ready()
    .then(
      () => { apiInstance.swagger(); },
      apiInstance.log.error,
    );
}
