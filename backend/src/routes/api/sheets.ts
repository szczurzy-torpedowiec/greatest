import { FastifyInstance } from 'fastify';
import {
  CreateRandomSheetsBody,
  createRandomSheetsBodySchema,
  CreateRandomSheetsReply,
  createRandomSheetsReplySchema,
  CreateSheetBody,
  createSheetBodySchema,
  CreateSheetReply,
  createSheetReplySchema,
  DeleteSheetBody,
  deleteSheetBodySchema,
  DeleteSheetReply,
  deleteSheetReplySchema,
  GetSheetReply,
  getSheetReplySchema,
  ListSheetsReply,
  listSheetsReplySchema,
  PatchSheetBody,
  patchSheetBodySchema,
  PatchSheetReply,
  patchSheetReplySchema,
  SheetParams,
  sheetParamsSchema,
  TestParams,
  testParamsSchema,
  PrintSheetsQuery, printSheetsQuerySchema, binarySchema,
} from 'greatest-api-schemas';
import { UpdateFilter, WithoutId } from 'mongodb';
import { nanoid } from 'nanoid';
import { DbManager } from '../../database/database';
import { getSecurity, requireAuthentication, requireTest } from '../../guards';
import { DbSheet, DbTest } from '../../database/types';
import {
  encryptSymmetrical, mapTimes, randomInt, shuffle,
} from '../../utils';
import { getRandomString } from '../../string-generator';
import { mapSheet, mapTestQuestions } from '../../mappers';
import { WebsocketBus } from '../../websocket-bus';
import { config } from '../../config';
import { PrintTokenBody } from '../../types';

export function registerSheets(
  apiInstance: FastifyInstance,
  dbManager: DbManager,
  websocketBus: WebsocketBus,
) {
  const generatePhrase = () => mapTimes(getRandomString, 2).join(' ');

  apiInstance.get<{
    Params: TestParams,
    Reply: ListSheetsReply,
  }>('/tests/:testShortId/sheets', {
    schema: {
      params: testParamsSchema,
      response: {
        200: listSheetsReplySchema,
      },
      security: getSecurity(),
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);
    return {
      sheets: await dbManager.sheetsCollection.find({
        testId: test._id,
      }).map(mapSheet).toArray(),
    };
  });

  const generateQrCodeId = async (): Promise<string> => {
    const qrCodeId = nanoid(6);
    if ((await dbManager.sheetsCollection.countDocuments({
      qrCodeId,
    })) > 0) return generateQrCodeId();
    return qrCodeId;
  };

  const getAnswerRandomOrder = (incorrectAnswerCount: number) => shuffle([
    null,
    ...mapTimes((x) => x, incorrectAnswerCount)]);

  apiInstance.post<{
    Params: TestParams,
    Body: CreateSheetBody,
    Reply: CreateSheetReply,
  }>('/tests/:testShortId/sheets/create', {
    schema: {
      params: testParamsSchema,
      body: createSheetBodySchema,
      response: {
        200: createSheetReplySchema,
      },
      security: getSecurity(),
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);
    const testQuestions = mapTestQuestions(test);
    if (testQuestions.length !== request.body.questionVariants.length) {
      throw apiInstance.httpErrors.badRequest(
        `Wrong number of question variants, expected ${testQuestions.length}`,
      );
    }
    const newSheet: WithoutId<DbSheet> = {
      testId: test._id,
      shortId: nanoid(10),
      qrCodeId: await generateQrCodeId(),
      phrase: generatePhrase(),
      student: request.body.student ?? '',
      questions: request.body.questionVariants.map((variant, questionIndex) => {
        const testQuestion = testQuestions[questionIndex];
        if (variant >= testQuestion.variants.length) {
          throw apiInstance.httpErrors.badRequest(
            `Variant specified in question ${questionIndex} does not exist`,
          );
        }
        const variantBase = {
          variant,
          points: null,
        } as const;
        switch (testQuestion.questionType) {
          case 'open': return {
            ...variantBase,
            type: 'open',
          };
          case 'quiz': return {
            ...variantBase,
            type: 'quiz',
            answerOrder: getAnswerRandomOrder(
              testQuestion.variants[variant].incorrectAnswers.length,
            ), // TODO: Specify order in request body
          };
        }
      }),
    };
    await dbManager.sheetsCollection.insertOne(newSheet);
    websocketBus.getTest(test._id).sheetCreate.emit(newSheet, request.body.requestId);
    return mapSheet(newSheet);
  });

  apiInstance.post<{
    Params: TestParams,
    Body: CreateRandomSheetsBody,
    Reply: CreateRandomSheetsReply,
  }>('/tests/:testShortId/sheets/create-random', {
    schema: {
      params: testParamsSchema,
      body: createRandomSheetsBodySchema,
      response: {
        200: createRandomSheetsReplySchema,
      },
      security: getSecurity(),
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);
    const testQuestions = mapTestQuestions(test);
    const sheets = await Promise.all(mapTimes<Promise<WithoutId<DbSheet>>>(async () => ({
      shortId: nanoid(10),
      testId: test._id,
      qrCodeId: await generateQrCodeId(),
      generated: null,
      phrase: generatePhrase(),
      student: '',
      questions: testQuestions.map((question) => {
        const variantBase = {
          variant: randomInt(question.variants.length),
          points: null,
        } as const;
        switch (question.questionType) {
          case 'open': {
            return {
              ...variantBase,
              type: 'open',
            };
          }
          case 'quiz': {
            return {
              ...variantBase,
              type: 'quiz',
              answerOrder: getAnswerRandomOrder(
                question.variants[variantBase.variant].incorrectAnswers.length,
              ),
            };
          }
        }
      }),
    }), request.body.count));
    await dbManager.sheetsCollection.insertMany(sheets);
    sheets.forEach(
      (sheet) => websocketBus.getTest(test._id).sheetCreate.emit(sheet, request.body.requestId),
    );
    return {
      newSheets: sheets.map(mapSheet),
    };
  });

  const getSheet = async (test: DbTest, sheetShortId: string) => {
    const sheet = await dbManager.sheetsCollection.findOne({
      testId: test._id,
      shortId: sheetShortId,
    });
    if (sheet === null) throw apiInstance.httpErrors.notFound(`Sheet ${sheetShortId} not found`);
    return sheet;
  };

  const updateSheet = async (test: DbTest, sheetShortId: string, update: UpdateFilter<DbSheet>) => {
    const { value } = await dbManager.sheetsCollection.findOneAndUpdate({
      testId: test._id,
      shortId: sheetShortId,
    }, update, {
      returnDocument: 'after',
    });
    if (value === null) throw apiInstance.httpErrors.notFound('Sheet not found');
    return value;
  };

  apiInstance.get<{
    Params: TestParams,
    Querystring: PrintSheetsQuery,
  }>('/tests/:testShortId/sheets/print', {
    schema: {
      params: testParamsSchema,
      querystring: printSheetsQuerySchema,
      response: {
        200: binarySchema,
      },
    },
  }, async (request, reply) => {
    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);
    await Promise.all(request.query.sheetShortIds.map(
      async (sheetShortId) => { await getSheet(test, sheetShortId); },
    ));
    const tokenBody: PrintTokenBody = {
      doubleSided: request.query.doubleSided,
      sheetShortIds: request.query.sheetShortIds,
      testShortId: request.params.testShortId,
    };
    const token = encryptSymmetrical(tokenBody, config.printTokenKey);
    console.log(token);
  });

  apiInstance.get<{
    Params: SheetParams,
    Reply: GetSheetReply,
  }>('/tests/:testShortId/sheets/:sheetShortId', {
    schema: {
      params: sheetParamsSchema,
      response: {
        200: getSheetReplySchema,
      },
      security: getSecurity(),
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);
    return mapSheet(await getSheet(test, request.params.sheetShortId));
  });

  apiInstance.patch<{
    Params: SheetParams,
    Body: PatchSheetBody,
    Reply: PatchSheetReply,
  }>('/tests/:testShortId/sheets/:sheetShortId', {
    schema: {
      params: sheetParamsSchema,
      body: patchSheetBodySchema,
      response: {
        200: patchSheetReplySchema,
      },
      security: getSecurity(),
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);
    const changedSheet = await updateSheet(test, request.params.sheetShortId, {
      $set: {
        student: request.body.student,
      },
    });
    websocketBus.getTest(test._id).sheetChange.emit(changedSheet, request.body.requestId);
    return {};
  });

  apiInstance.delete<{
    Params: SheetParams,
    Body: DeleteSheetBody,
    Reply: DeleteSheetReply,
  }>('/tests/:testShortId/sheets/:sheetShortId', {
    schema: {
      params: sheetParamsSchema,
      body: deleteSheetBodySchema,
      response: {
        200: deleteSheetReplySchema,
      },
      security: getSecurity(),
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);
    const sheet = await getSheet(test, request.params.sheetShortId);
    const scanCount = await dbManager.scansCollection.countDocuments({
      'sheet.id': sheet._id,
    });
    if (scanCount > 0) throw apiInstance.httpErrors.badRequest('Sheet has assigned scans');
    await dbManager.sheetsCollection.deleteOne({
      _id: sheet._id,
    });
    websocketBus.getTest(test._id).sheetDelete.emit(sheet, request.body.requestId);
    return {};
  });
}
