import { FastifyRequest } from 'fastify';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { DbManager } from './database/database';
import { DbApiToken, DbUser } from './database/types';

export class InvalidApiTokenError extends Error {
  constructor() { super('InvalidApiTokenError'); }
}

export async function getAndVerifyApiToken(
  rawToken: string,
  dbManager: DbManager,
): Promise<DbApiToken> {
  const token = rawToken.trim();
  const parts = rawToken.split(':');
  if (parts.length !== 2) throw new InvalidApiTokenError();
  const apiToken = await dbManager.apiTokensCollection.findOne({
    tokenId: parts[0],
  });
  if (!apiToken) throw new InvalidApiTokenError();
  if (!await bcrypt.compare(token, apiToken.tokenHash)) throw new InvalidApiTokenError();
  return apiToken;
}

export async function getAuthenticatedUser(
  request: FastifyRequest,
  dbManager: DbManager,
  allowToken: boolean,
): Promise<{
    user: DbUser,
    isToken: boolean,
  } | null> {
  let rawToken = request.headers['x-api-token'];
  if (Array.isArray(rawToken)) [rawToken] = rawToken;
  if (rawToken) {
    if (!allowToken) throw request.server.httpErrors.unauthorized('API tokens are not accepted for this resource');
    let apiToken: DbApiToken;
    try {
      apiToken = await getAndVerifyApiToken(rawToken, dbManager);
    } catch (error) {
      if (!(error instanceof InvalidApiTokenError)) request.server.log.error(error);
      throw request.server.httpErrors.unauthorized('Invalid API token');
    }
    const user = await dbManager.usersCollection.findOne(apiToken.ownerId);
    if (user === null) throw request.server.httpErrors.unauthorized();
    return {
      user,
      isToken: true,
    };
  }
  const userId: string = request.session.get('user-id');
  if (!userId) return null;
  const user = await dbManager.usersCollection.findOne(ObjectId.createFromHexString(userId));
  if (!user) {
    request.session.set('user-id', undefined);
    return null;
  }
  return {
    user,
    isToken: false,
  };
}

export async function requireAuthentication(
  request: FastifyRequest,
  dbManager: DbManager,
  allowToken: boolean,
): Promise<DbUser> {
  const authenticatedUser = await getAuthenticatedUser(request, dbManager, allowToken);
  if (authenticatedUser === null) throw request.server.httpErrors.unauthorized();
  return authenticatedUser.user;
}

export async function requireTest(
  request: FastifyRequest,
  dbManager: DbManager,
  user: DbUser,
  shortId: string,
) {
  const test = await dbManager.testsCollection.findOne({
    shortId,
  });
  if (test === null) throw request.server.httpErrors.notFound('Test not found');
  if (!test.ownerId.equals(user._id)) throw request.server.httpErrors.forbidden();
  return test;
}

export function requireScan() {

}
