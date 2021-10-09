import { FastifyInstance } from 'fastify';
import { GenerateAuthUrlOpts } from 'google-auth-library';
import { ObjectId } from 'mongodb';
import { DbManager } from '../database/database';
import { getAuthClient } from '../auth-utils';

export interface AuthPluginOptions {
  dbManager: DbManager;
}
export async function AuthPlugin(authInstance: FastifyInstance, { dbManager }: AuthPluginOptions) {
  const client = await getAuthClient();

  const generateAuthUrl = (retry: boolean, sub?: string) => {
    const opts: GenerateAuthUrlOpts = {
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'openid',
      ],
      access_type: 'offline',
      prompt: retry ? 'consent' : 'select_account',
      login_hint: sub,
    };
    return client.generateAuthUrl(opts);
  };

  authInstance.get('/sign-in/google', async (request, reply) => {
    const userId: string | undefined = request.session.get('user-id');
    if (userId !== undefined) {
      const user = await dbManager.usersCollection.findOne(ObjectId.createFromHexString(userId));
      if (user === null) request.session.set('user-id', undefined);
      else {
        reply.redirect('/');
        return;
      }
    }
    reply.redirect(generateAuthUrl(false));
  });

  authInstance.get<{
    Querystring: Record<string, unknown>
  }>('/google-callback', async (request, reply) => {
    if (typeof request.query.code !== 'string') throw authInstance.httpErrors.badRequest('Missing code param');
    const { tokens } = await client.getToken(request.query.code);
    if (!tokens.id_token) {
      authInstance.log.error('Missing id_token');
      throw authInstance.httpErrors.internalServerError();
    }
    const loginTicket = await client.verifyIdToken({
      idToken: tokens.id_token,
    });
    const id = loginTicket.getUserId();
    if (id === null) throw authInstance.httpErrors.internalServerError('Cannot get user id');
    const user = await dbManager.usersCollection.findOne({
      googleId: id,
    });
    let userId;
    if (user) userId = user._id;
    else {
      if (!tokens.refresh_token) {
        authInstance.log.info('Account not found in database, but refresh token is missing. Redirecting...');
        reply.redirect(generateAuthUrl(true, loginTicket.getPayload()?.sub));
        return;
      }
      const email = loginTicket.getPayload()?.email;
      if (email === undefined) {
        authInstance.log.error('Missing email in id_token');
        throw authInstance.httpErrors.internalServerError();
      }
      const { insertedId } = await dbManager.usersCollection.insertOne({
        googleId: id,
        googleRefreshToken: tokens.refresh_token,
        email,
      });
      userId = insertedId;
    }
    request.session.set('user-id', userId.toHexString());
    reply.redirect('/');
  });

  authInstance.get('/sign-out', (request, reply) => {
    request.session.set('user-id', undefined);
    reply.redirect('/');
  });
}
