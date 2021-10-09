import { FastifyInstance } from 'fastify';
import { GetViewerReply, getViewerReplySchema } from 'greatest-api-schemas';
import { DbManager } from '../../database/database';
import { getAuthenticatedUser } from '../../guards';
import { getUserInfo } from '../../auth-utils';

export function registerUserInfo(apiInstance: FastifyInstance, dbManager: DbManager) {
  apiInstance.get<{
    Reply: GetViewerReply,
  }>('/viewer', {
    schema: {
      response: {
        200: getViewerReplySchema,
      },
    },
  }, async (request) => {
    const authenticatedUser = await getAuthenticatedUser(request, dbManager, true);
    if (authenticatedUser === null) return null;
    const userInfo = await getUserInfo(authenticatedUser.user, true);
    return {
      email: authenticatedUser.user.email,
      name: userInfo.name,
      avatarUrl: userInfo.picture,
    };
  });
}
