import { FastifyInstance } from 'fastify';
import {
  CreateQuestionSetBody,
  createQuestionSetBodySchema,
  CreateQuestionSetReply,
  createQuestionSetReplySchema,
  ListQuestionSetsReply,
  listQuestionSetsReplySchema,
  PatchQuestionSetBody, patchQuestionSetBodySchema,
  PatchQuestionSetReply, patchQuestionSetReplySchema,
  QuestionSetParams,
  questionSetParamsSchema,
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

  apiInstance.get<{
    Reply: ListQuestionSetsReply,
  }>('/question-sets/list', {
    schema: {
      response: {
        200: listQuestionSetsReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    return {
      questionSets: await dbManager.questionSetsCollection
        .find({
          ownerId: user._id,
        })
        .map((set) => ({
          shortId: set.shortId,
          name: set.name,
        }))
        .toArray(),
    };
  });

  apiInstance.patch<{
    Params: QuestionSetParams,
    Body: PatchQuestionSetBody,
    Reply: PatchQuestionSetReply,
  }>('/question-sets/:setShortId', {
    schema: {
      params: questionSetParamsSchema,
      body: patchQuestionSetBodySchema,
      response: {
        200: patchQuestionSetReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const questionSet = await dbManager.questionSetsCollection.findOne({
      shortId: request.params.setShortId,
    });
    if (questionSet === null) return apiInstance.httpErrors.notFound('Question set not found');
    if (!questionSet.ownerId.equals(user._id)) throw apiInstance.httpErrors.forbidden();
    await dbManager.questionSetsCollection.updateOne({
      _id: questionSet._id,
    }, {
      $set: {
        name: request.body.name,
      },
    });
    return {};
  });
}
