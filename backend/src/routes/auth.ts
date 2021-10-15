import { FastifyInstance, FastifyRequest } from 'fastify';
import { GenerateAuthUrlOpts } from 'google-auth-library';
import { ObjectId } from 'mongodb';
import {
  CreateDemoUserReply,
  createDemoUserReplySchema,
  DemoSignInBody,
  demoSignInBodySchema,
} from 'greatest-api-schemas';
import faker from 'faker/locale/pl';
import bcrypt from 'bcrypt';
import { DbManager } from '../database/database';
import { getAuthClient } from '../auth-utils';
import { config } from '../config';
import { randomElement } from '../utils';
import { DbUserDemo } from '../database/types';

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

  const alreadySignedIn = async (request: FastifyRequest): Promise<boolean> => {
    const userId: string | undefined = request.session.get('user-id');
    if (userId === undefined) return false;
    const user = await dbManager.usersCollection.findOne(ObjectId.createFromHexString(userId));
    if (user !== null) return true;
    request.session.set('user-id', undefined);
    return false;
  };

  authInstance.get('/sign-in/google', async (request, reply) => {
    if (await alreadySignedIn(request)) {
      reply.redirect('/');
      return;
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
        type: 'google',
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

  if (config.allowDemoLogin) {
    authInstance.log.warn('Demo login enabled');

    authInstance.post<{
      Reply: CreateDemoUserReply,
    }>('/create-demo-user', {
      schema: {
        response: {
          200: createDemoUserReplySchema,
        },
      },
    }, async () => {
      const password = faker.internet.password(10, true);
      const passwordHash = await bcrypt.hash(password, 8);
      const gender = randomElement([0, 1]);
      const firstName = faker.name.firstName(gender);
      const lastName = faker.name.lastName(gender);
      const email = faker.internet.exampleEmail(firstName, lastName);
      const name = `${firstName} ${lastName}`;
      const avatarUrl = faker.internet.avatar();
      await dbManager.usersCollection.insertOne({
        type: 'demo',
        email,
        avatarUrl,
        name,
        passwordHash,
      });
      return {
        name,
        email,
        password,
      };
    });

    authInstance.post<{
      Body: DemoSignInBody,
    }>('/sign-in/demo', {
      schema: {
        body: demoSignInBodySchema,
      },
    }, async (request, reply) => {
      if (await alreadySignedIn(request)) {
        reply.redirect('/');
        return;
      }
      const user = await dbManager.usersCollection.findOne({
        type: 'demo',
        email: request.body.email,
      }) as DbUserDemo | null;
      if (user === null) throw authInstance.httpErrors.notFound('User not found');
      if (!await bcrypt.compare(request.body.password, user.passwordHash)) {
        throw authInstance.httpErrors.forbidden('Invalid password');
      }
      request.session.set('user-id', user._id.toHexString());
      reply.redirect('/');
    });
  }
}
