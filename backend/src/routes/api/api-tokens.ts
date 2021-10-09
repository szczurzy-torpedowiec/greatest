import { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import {
  EmptyReply,
  emptyReplySchema,
  GenerateTokenBody,
  generateTokenBodySchema,
  GenerateTokenReply,
  generateTokenReplySchema,
  ListTokensReply,
  listTokensReplySchema,
  RevokeTokenBody,
  revokeTokenBodySchema,
} from 'greatest-api-schemas';
import { DbManager } from '../../database/database';
import { requireAuthentication } from '../../guards';

export function registerAPITokens(apiInstance: FastifyInstance, dbManager: DbManager) {
  apiInstance.post<{
    Body: GenerateTokenBody,
    Reply: GenerateTokenReply,
  }>('/api-tokens/generate', {
    schema: {
      body: generateTokenBodySchema,
      response: {
        200: generateTokenReplySchema,
      },
      security: [
        { sessionCookie: [] },
      ],
      tags: ['internal'],
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, false);
    try {
      let tokenId;
      do {
        tokenId = nanoid(15);
        // eslint-disable-next-line no-await-in-loop
      } while ((await dbManager.apiTokensCollection.findOne({ tokenId })) !== null);
      const keySecret = nanoid(15);
      const token = `${tokenId}:${keySecret}`;
      const hash = await bcrypt.hash(token, 8);
      const createdOn = new Date();
      await dbManager.apiTokensCollection.insertOne({
        tokenId,
        tokenHash: hash,
        ownerId: user._id,
        createdOn,
        name: request.body.name,
      });
      return {
        tokenId,
        token,
        name: request.body.name,
        createdOn: createdOn.toISOString(),
      };
    } catch (error) {
      apiInstance.log.error(error);
      throw apiInstance.httpErrors.internalServerError();
    }
  });

  apiInstance.get<{
    Reply: ListTokensReply,
  }>('/api-tokens/list', {
    schema: {
      response: {
        200: listTokensReplySchema,
      },
      security: [
        { sessionCookie: [] },
      ],
      tags: ['internal'],
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, false);
    const tokens = await dbManager.apiTokensCollection.find({
      ownerId: user._id,
    }).map((token) => ({
      tokenId: token.tokenId,
      name: token.name,
      createdOn: token.createdOn.toISOString(),
    })).toArray();
    return {
      tokens,
    };
  });

  apiInstance.post<{
    Body: RevokeTokenBody,
    Reply: EmptyReply,
  }>('/api-tokens/revoke', {
    schema: {
      body: revokeTokenBodySchema,
      response: {
        200: emptyReplySchema,
      },
      security: [
        { sessionCookie: [] },
      ],
      tags: ['internal'],
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, false);
    let tokenId: string;
    if (request.body.type === 'token') [tokenId] = request.body.value.split(':');
    else tokenId = request.body.value;
    const token = await dbManager.apiTokensCollection.findOne({
      tokenId,
    });
    if (token === null) throw apiInstance.httpErrors.notFound('Token not found');
    if (!token.ownerId.equals(user._id)) throw apiInstance.httpErrors.forbidden();
    await dbManager.apiTokensCollection.deleteOne({
      tokenId,
    });
    return {};
  });
}
