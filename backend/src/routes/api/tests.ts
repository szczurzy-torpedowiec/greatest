import { FastifyInstance } from 'fastify';
import {
  CreateTestBody,
  createTestBodySchema,
  CreateTestReply,
  createTestReplySchema, GetTestReply, getTestReplySchema,
  ListTestsReply,
  listTestsReplySchema,
  PatchTestBody,
  patchTestBodySchema,
  PatchTestReply,
  patchTestReplySchema,
  TestParams,
  testParamsSchema,
} from 'greatest-api-schemas';
import { nanoid } from 'nanoid';
import { DbManager } from '../../database/database';
import { requireAuthentication, requireTest } from '../../guards';
import { DbQuestion, DbQuestionVariantBase } from '../../database/types';
import { promiseCache } from '../../utils';

export function registerTests(apiInstance: FastifyInstance, dbManager: DbManager) {
  apiInstance.get<{
    Reply: ListTestsReply
  }>('/tests/list', {
    schema: {
      response: {
        200: listTestsReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    return {
      tests: await dbManager.testsCollection.find({
        ownerId: user._id,
      }).map((test) => ({
        shortId: test.shortId,
        name: test.name,
        createdOn: test.createdOn.toISOString(),
      })).toArray(),
    };
  });

  const mapVariants = <T extends DbQuestionVariantBase<true>, X>(
    variants: T[],
    shortIds: string[],
    mapper: (variant: T) => X,
  ): X[] => shortIds.map(
      (shortId) => {
        const variant = variants.find((x) => x.shortId === shortId);
        if (variant === undefined) throw apiInstance.httpErrors.notFound(`Variant ${shortId} not found`);
        return mapper(variant);
      },
    );

  apiInstance.post<{
    Body: CreateTestBody,
    Reply: CreateTestReply,
  }>('/tests/create', {
    schema: {
      body: createTestBodySchema,
      response: {
        200: createTestReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const shortId = nanoid(10);
    const createdOn = new Date();
    const getQuestionSet = promiseCache(
      async (setShortId: string) => {
        const questionSet = await dbManager.questionSetsCollection.findOne({
          shortId: setShortId,
        });
        if (questionSet === null) throw apiInstance.httpErrors.notFound(`Question set "${setShortId}" not found`);
        if (!questionSet.ownerId.equals(user._id)) throw apiInstance.httpErrors.forbidden(`User does not own question set "${setShortId}"`);
        return questionSet;
      },
    );
    await dbManager.withTransaction(async () => {
      const questions: DbQuestion<false>[] = await Promise.all(
        request.body.questions.map<Promise<DbQuestion<false>>>(async (question) => {
          const dbSet = await getQuestionSet(question.questionSetShortId);
          const dbQuestion = await dbManager.questionsCollection.findOne({
            questionSetId: dbSet._id,
            shortId: question.questionShortId,
          });
          if (dbQuestion === null) throw apiInstance.httpErrors.notFound(`Question "${question.questionShortId}" not found`);
          switch (dbQuestion.type) {
            case 'open': return {
              type: 'open',
              maxPoints: dbQuestion.maxPoints,
              variants: mapVariants(
                dbQuestion.variants,
                question.variants,
                (variant) => {
                  if (variant.content.trim() === '') throw apiInstance.httpErrors.badRequest(`Content of variant "${variant.shortId}" is empty`);
                  return ({
                    content: variant.content,
                  });
                },
              ),
            };
            case 'quiz': return {
              type: 'quiz',
              maxPoints: dbQuestion.maxPoints,
              variants: mapVariants(
                dbQuestion.variants,
                question.variants,
                (variant) => {
                  if (variant.content.trim() === '') throw apiInstance.httpErrors.badRequest(`Content of variant "${variant.shortId}" is empty`);
                  if (variant.correctAnswer.trim() === '') throw apiInstance.httpErrors.badRequest(`Correct answer of variant "${variant.shortId}" is empty`);
                  variant.incorrectAnswers.forEach((answer, index) => {
                    if (answer.trim() === '') throw apiInstance.httpErrors.badRequest(`Incorrect answer ${index} of variant "${variant.shortId}" is empty`);
                  });
                  return ({
                    content: variant.content,
                    incorrectAnswers: variant.incorrectAnswers,
                    correctAnswer: variant.correctAnswer,
                  });
                },
              ),
            };
          }
        }),
      );
      await dbManager.testsCollection.insertOne({
        shortId,
        ownerId: user._id,
        name: request.body.name,
        createdOn,
        questions,
      });
    });
    return {
      shortId,
      createdOn: createdOn.toISOString(),
    };
  });

  apiInstance.get<{
    Params: TestParams,
    Reply: GetTestReply,
  }>('/tests/:testShortId', {
    schema: {
      params: testParamsSchema,
      response: {
        200: getTestReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);
    return {
      name: test.name,
      questions: test.questions,
    };
  });

  apiInstance.patch<{
    Params: TestParams,
    Body: PatchTestBody,
    Reply: PatchTestReply,
  }>('/tests/:testShortId', {
    schema: {
      params: testParamsSchema,
      body: patchTestBodySchema,
      response: {
        200: patchTestReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);
    await dbManager.testsCollection.updateOne({
      _id: test._id,
    }, {
      $set: {
        name: request.body.name,
      },
    });
    return {};
  });
}
