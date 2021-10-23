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
import { getSecurity, requireAuthentication, requireTest } from '../../guards';
import { DbPageElement, DbQuestionVariantBase } from '../../database/types';
import { DefaultsMap } from '../../utils';

export function registerTests(apiInstance: FastifyInstance, dbManager: DbManager) {
  apiInstance.get<{
    Reply: ListTestsReply
  }>('/tests/list', {
    schema: {
      response: {
        200: listTestsReplySchema,
      },
      security: getSecurity(),
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
      security: getSecurity(),
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const shortId = nanoid(10);
    const createdOn = new Date();
    const getQuestionSet = (setShortId: string) => new DefaultsMap(
      async (newSetShortId: string) => {
        const questionSet = await dbManager.questionSetsCollection.findOne({
          shortId: newSetShortId,
        });
        if (questionSet === null) throw apiInstance.httpErrors.notFound(`Question set "${shortId}" not found`);
        if (!questionSet.ownerId.equals(user._id)) throw apiInstance.httpErrors.forbidden(`User does not own question set "${shortId}"`);
        return questionSet;
      },
    ).get(setShortId);
    await dbManager.withTransaction(async () => {
      const pages: DbPageElement[][] = await Promise.all(
        request.body.pages.map((page) => Promise.all(page.map(async (element) => {
          const dbSet = await getQuestionSet(element.questionSetShortId);
          const dbQuestion = await dbManager.questionsCollection.findOne({
            questionSetId: dbSet._id,
            shortId: element.questionShortId,
          });
          if (dbQuestion === null) throw apiInstance.httpErrors.notFound(`Question "${element.questionShortId}" not found`);
          switch (dbQuestion.questionType) {
            case 'open': return {
              elementType: 'question',
              questionType: 'open',
              maxPoints: dbQuestion.maxPoints,
              variants: mapVariants(
                dbQuestion.variants,
                element.variants,
                (variant) => {
                  if (variant.content.trim() === '') throw apiInstance.httpErrors.badRequest(`Content of variant "${variant.shortId}" is empty`);
                  return ({
                    content: variant.content,
                  });
                },
              ),
            } as const;
            case 'quiz': return {
              elementType: 'question',
              questionType: 'quiz',
              maxPoints: dbQuestion.maxPoints,
              variants: mapVariants(
                dbQuestion.variants,
                element.variants,
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
            } as const;
          }
        }))),
      );
      await dbManager.testsCollection.insertOne({
        shortId,
        ownerId: user._id,
        name: request.body.name,
        createdOn,
        pages,
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
      security: getSecurity(),
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);
    return {
      name: test.name,
      pages: test.pages,
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
      security: getSecurity(),
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
