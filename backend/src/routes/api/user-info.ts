import { FastifyInstance } from 'fastify';
import { GetViewerReply, getViewerReplySchema } from 'greatest-api-schemas';
import { DbManager } from '../../database/database';
import { getAuthenticatedUser, getSecurity } from '../../guards';
import { getGoogleUserInfo } from '../../auth-utils';

export function registerUserInfo(apiInstance: FastifyInstance, dbManager: DbManager) {
  apiInstance.get<{
    Reply: GetViewerReply,
  }>('/viewer', {
    schema: {
      response: {
        200: getViewerReplySchema,
      },
      security: getSecurity(),
    },
  }, async (request) => {
    const authenticatedUser = await getAuthenticatedUser(request, dbManager, true);
    if (authenticatedUser === null) return null;
    if (authenticatedUser.user.type === 'demo') {
      return {
        email: authenticatedUser.user.email,
        name: authenticatedUser.user.name,
        avatarUrl: authenticatedUser.user.avatarUrl,
      };
    }
    const userInfo = await getGoogleUserInfo(authenticatedUser.user, true);
    return {
      email: authenticatedUser.user.email,
      name: userInfo.name,
      avatarUrl: userInfo.picture,
    };
  });
}
