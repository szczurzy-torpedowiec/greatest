import { FastifyInstance } from 'fastify';
import {
  CreateQuestionSetBody,
  createQuestionSetBodySchema,
  CreateQuestionSetReply, createQuestionSetReplySchema,
} from 'greatest-api-schemas';
import { nanoid } from 'nanoid';
import { DbManager } from '../../database/database';
import { requireAuthentication } from '../../guards';

export function registerQuestionSets(apiInstance: FastifyInstance, dbManager: DbManager) {
  apiInstance.post<{
    Body: CreateQuestionSetBody,
    Reply: CreateQuestionSetReply,
  }>('/question-sets/create', {
    schema: {
      body: createQuestionSetBodySchema,
      response: {
        200: createQuestionSetReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const shortId = nanoid(10);
    await dbManager.questionSetsCollection.insertOne({
      name: request.body.name,
      ownerId: user._id,
      shortId,
    });
    return {
      shortId,
    };
  });
}
