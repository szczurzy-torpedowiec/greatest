import { FastifyInstance } from 'fastify';
import {
  CreateQuestionBody,
  createQuestionBodySchema,
  CreateQuestionReply,
  createQuestionReplySchema,
  CreateQuestionSetBody,
  createQuestionSetBodySchema,
  CreateQuestionSetReply,
  createQuestionSetReplySchema,
  CreateQuestionVariantBody,
  createQuestionVariantBodySchema,
  CreateQuestionVariantReply,
  createQuestionVariantReplySchema,
  DeleteQuestionReply, DeleteQuestionSetReply,
  DeleteQuestionVariantReply,
  deleteQuestionVariantReplySchema,
  GetQuestionReply,
  getQuestionReplySchema,
  GetQuestionSetReply,
  getQuestionSetReplySchema,
  ListQuestionSetsReply,
  listQuestionSetsReplySchema,
  PatchQuestionBody, patchQuestionBodySchema,
  PatchQuestionReply,
  PatchQuestionSetBody,
  patchQuestionSetBodySchema,
  PatchQuestionSetReply,
  patchQuestionSetReplySchema,
  PatchQuestionVariantBody,
  patchQuestionVariantBodySchema,
  PatchQuestionVariantReply,
  patchQuestionVariantReplySchema,
  QuestionParams,
  questionParamsSchema,
  QuestionSetParams,
  questionSetParamsSchema,
  QuestionVariantOpen,
  QuestionVariantParams,
  questionVariantParamsSchema,
  QuestionVariantQuiz,
  QuestionWithIds,
} from 'greatest-api-schemas';
import { nanoid } from 'nanoid';
import { UpdateFilter } from 'mongodb';
import { DbManager } from '../../database/database';
import { requireAuthentication } from '../../guards';
import {
  DbQuestion,
  DbQuestionVariantOpen,
  DbQuestionVariantQuiz,
  DbUser,
} from '../../database/types';

export function registerQuestionSets(apiInstance: FastifyInstance, dbManager: DbManager) {
  const requireQuestionSet = async (shortId: string, user: DbUser) => {
    const questionSet = await dbManager.questionSetsCollection.findOne({
      shortId,
    });
    if (questionSet === null) return apiInstance.httpErrors.notFound('Question set not found');
    if (!questionSet.ownerId.equals(user._id)) throw apiInstance.httpErrors.forbidden();
    return questionSet;
  };

  const requireQuestion = async (setShortId: string, questionShortId: string, user: DbUser) => {
    const questionSet = await requireQuestionSet(setShortId, user);
    const question = await dbManager.questionsCollection.findOne({
      questionSetId: questionSet._id,
      shortId: questionShortId,
    });
    if (question === null) throw apiInstance.httpErrors.notFound('Question not found');
    return { questionSet, question };
  };

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

  const mapQuestion = (question: DbQuestion) => {
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
  };

  apiInstance.get<{
    Params: QuestionSetParams,
    Reply: GetQuestionSetReply,
  }>('/question-sets/:setShortId', {
    schema: {
      params: questionSetParamsSchema,
      response: {
        200: getQuestionSetReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const questionSet = await requireQuestionSet(request.params.setShortId, user);
    return {
      name: questionSet.name,
      questions: await dbManager.questionsCollection.find({
        questionSetId: questionSet._id,
      }).map(mapQuestion).toArray(),
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

  apiInstance.delete<{
    Params: QuestionSetParams,
    Reply: DeleteQuestionSetReply,
  }>('/question-sets/:setShortId', {
    schema: {
      params: questionSetParamsSchema,
      response: {
        200: patchQuestionSetReplySchema,
      },
    },
  }, async (request) => {
    await dbManager.withSession(
      (session) => session.withTransaction(async () => {
        const user = await requireAuthentication(request, dbManager, true);
        const questionSet = await requireQuestionSet(request.params.setShortId, user);
        await dbManager.questionSetsCollection.deleteOne({
          _id: questionSet._id,
        });
        await dbManager.questionsCollection.deleteMany({
          questionSetId: questionSet._id,
        });
      }),
    );
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
    Params: QuestionParams,
    Reply: GetQuestionReply,
  }>('/question-sets/:setShortId/questions/:questionShortId', {
    schema: {
      params: questionParamsSchema,
      response: {
        200: getQuestionReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const { question } = await requireQuestion(
      request.params.setShortId,
      request.params.questionShortId,
      user,
    );
    return mapQuestion(question);
  });

  apiInstance.patch<{
    Params: QuestionParams,
    Body: PatchQuestionBody,
    Reply: PatchQuestionReply,
  }>('/question-sets/:setShortId/questions/:questionShortId', {
    schema: {
      params: questionParamsSchema,
      body: patchQuestionBodySchema,
      response: {
        200: getQuestionReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const { question } = await requireQuestion(
      request.params.setShortId,
      request.params.questionShortId,
      user,
    );
    await dbManager.questionsCollection.updateOne({
      _id: question._id,
    }, {
      $set: {
        maxPoints: request.body.maxPoints,
      },
    });
    return {};
  });

  apiInstance.delete<{
    Params: QuestionParams,
    Reply: DeleteQuestionReply,
  }>('/question-sets/:setShortId/questions/:questionShortId', {
    schema: {
      params: questionParamsSchema,
      response: {
        200: getQuestionReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const { question } = await requireQuestion(
      request.params.setShortId,
      request.params.questionShortId,
      user,
    );
    await dbManager.questionsCollection.deleteOne({
      _id: question._id,
    });
    return {};
  });

  apiInstance.post<{
    Params: QuestionParams,
    Body: CreateQuestionVariantBody,
    Reply: CreateQuestionVariantReply,
  }>('/question-sets/:setShortId/questions/:questionShortId/variants/create', {
    schema: {
      params: questionParamsSchema,
      body: createQuestionVariantBodySchema,
      response: {
        200: createQuestionVariantReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const { question } = await requireQuestion(
      request.params.setShortId,
      request.params.questionShortId,
      user,
    );
    if (question.type !== request.body.type) {
      throw apiInstance.httpErrors.badRequest('Variant type does not match question type');
    }
    const shortId = nanoid(10);
    const update = (variant: DbQuestionVariantQuiz | DbQuestionVariantOpen) => dbManager
      .questionsCollection.updateOne({
        _id: question._id,
      }, {
        $push: { variants: variant },
      });

    switch (request.body.type) {
      case 'open': {
        const variant: QuestionVariantOpen = {
          shortId,
          content: request.body.content,
        };
        await update(variant);
        break;
      }
      case 'quiz': {
        const variant: QuestionVariantQuiz = {
          shortId,
          content: request.body.content,
          incorrectAnswers: request.body.incorrectAnswers,
          correctAnswer: request.body.correctAnswer,
        };
        await update(variant);
        break;
      }
    }
    return {
      shortId,
    };
  });

  apiInstance.patch<{
    Params: QuestionVariantParams,
    Body: PatchQuestionVariantBody,
    Reply: PatchQuestionVariantReply,
  }>('/question-sets/:setShortId/questions/:questionShortId/variants/:variantShortId', {
    schema: {
      params: questionVariantParamsSchema,
      body: patchQuestionVariantBodySchema,
      response: {
        200: patchQuestionVariantReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const { question } = await requireQuestion(
      request.params.setShortId,
      request.params.questionShortId,
      user,
    );
    if (question.type !== request.body.type) {
      throw apiInstance.httpErrors.badRequest('Variant type does not match question type');
    }
    if (!question.variants.some(
      (variant) => variant.shortId === request.params.variantShortId,
    )) throw apiInstance.httpErrors.notFound('Variant not found');

    const updateVariant = (
      update: UpdateFilter<DbQuestion> | Partial<DbQuestion>,
    ) => dbManager.questionsCollection.updateOne({
      _id: question._id,
      variants: {
        shortId: request.params.variantShortId,
      },
    }, update);

    switch (request.body.type) {
      case 'open': {
        await updateVariant({
          $set: {
            'variants.$.content': request.body.content,
          },
        });
        break;
      }
      case 'quiz': {
        await updateVariant({
          $set: {
            'variants.$.content': request.body.content,
            'variants.$.correctAnswer': request.body.correctAnswer,
            'variants.$.incorrectAnswers': request.body.incorrectAnswers,
          },
        });
        break;
      }
    }
    return {};
  });

  apiInstance.delete<{
    Params: QuestionVariantParams,
    Reply: DeleteQuestionVariantReply,
  }>('/question-sets/:setShortId/questions/:questionShortId/variants/:variantShortId', {
    schema: {
      params: questionVariantParamsSchema,
      response: {
        200: deleteQuestionVariantReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const { question } = await requireQuestion(
      request.params.setShortId,
      request.params.questionShortId,
      user,
    );
    if (!question.variants.some(
      (variant) => variant.shortId === request.params.variantShortId,
    )) throw apiInstance.httpErrors.notFound('Variant not found');

    await dbManager.questionsCollection.updateOne({
      _id: question._id,
    }, {
      $pull: {
        variants: {
          shortId: request.params.variantShortId,
        },
      },
    });
    return {};
  });
}
