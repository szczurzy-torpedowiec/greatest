import { FastifyInstance } from 'fastify';
import {
  CreateQuestionBody, createQuestionBodySchema, CreateQuestionReply, createQuestionReplySchema,
  CreateQuestionSetBody,
  createQuestionSetBodySchema,
  CreateQuestionSetReply,
  createQuestionSetReplySchema,
  ListQuestionSetsReply,
  listQuestionSetsReplySchema, ListQuestionsReply, listQuestionsReplySchema,
  PatchQuestionSetBody, patchQuestionSetBodySchema,
  PatchQuestionSetReply, patchQuestionSetReplySchema,
  QuestionSetParams,
  questionSetParamsSchema, QuestionWithIds,
} from 'greatest-api-schemas';
import { nanoid } from 'nanoid';
import { DbManager } from '../../database/database';
import { requireAuthentication } from '../../guards';
import { DbUser } from '../../database/types';

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
      questionSets: await Promise.all(await dbManager.questionSetsCollection
        .find({
          ownerId: user._id,
        })
        .map(async (set) => ({
          shortId: set.shortId,
          name: set.name,
          questionCount: await dbManager.questionsCollection.countDocuments({
            questionSetId: set._id,
          }),
        }))
        .toArray()),
    };
  });

  const requireQuestionSet = async (shortId: string, user: DbUser) => {
    const questionSet = await dbManager.questionSetsCollection.findOne({
      shortId,
    });
    if (questionSet === null) return apiInstance.httpErrors.notFound('Question set not found');
    if (!questionSet.ownerId.equals(user._id)) throw apiInstance.httpErrors.forbidden();
    return questionSet;
  };

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
    const questionSet = await requireQuestionSet(request.params.setShortId, user);
    await dbManager.questionSetsCollection.updateOne({
      _id: questionSet._id,
    }, {
      $set: {
        name: request.body.name,
      },
    });
    return {};
  });

  apiInstance.post<{
    Params: QuestionSetParams,
    Body: CreateQuestionBody,
    Reply: CreateQuestionReply,
  }>('/question-sets/:setShortId/questions/create', {
    schema: {
      params: questionSetParamsSchema,
      body: createQuestionBodySchema,
      response: {
        200: createQuestionReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const questionSet = await requireQuestionSet(request.params.setShortId, user);
    const shortId = nanoid(10);
    const base = {
      shortId,
      questionSetId: questionSet._id,
      maxPoints: request.body.maxPoints,
    };
    switch (request.body.type) {
      case 'quiz':
        await dbManager.questionsCollection.insertOne({
          ...base,
          type: 'quiz',
          variants: request.body.variants.map((variant) => ({
            shortId: nanoid(10),
            ...variant,
          })),
        });
        break;
      case 'open':
        await dbManager.questionsCollection.insertOne({
          ...base,
          type: 'open',
          variants: request.body.variants.map((variant) => ({
            shortId: nanoid(10),
            ...variant,
          })),
        });
        break;
    }
    return {
      shortId,
    };
  });

  apiInstance.get<{
    Params: QuestionSetParams,
    Reply: ListQuestionsReply,
  }>('/question-sets/:setShortId/questions/list', {
    schema: {
      params: questionSetParamsSchema,
      response: {
        200: listQuestionsReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const questionSet = await requireQuestionSet(request.params.setShortId, user);
    return {
      questions: await dbManager.questionsCollection.find({
        questionSetId: questionSet._id,
      }).map((question) => {
        const common = {
          shortId: question.shortId,
          maxPoints: question.maxPoints,
        };
        let mappedQuestion: QuestionWithIds;
        switch (question.type) {
          case 'quiz':
            mappedQuestion = {
              ...common,
              type: 'quiz',
              variants: question.variants.map((variant) => ({
                shortId: variant.shortId,
                content: variant.content,
                correctAnswer: variant.correctAnswer,
                incorrectAnswers: variant.incorrectAnswers,
              })),
            };
            break;
          case 'open':
            mappedQuestion = {
              ...common,
              type: 'open',
              variants: question.variants.map((variant) => ({
                shortId: variant.shortId,
                content: variant.content,
              })),
            };
            break;
        }
        return mappedQuestion;
      }).toArray(),
    };
  });
}
