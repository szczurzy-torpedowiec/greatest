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
  GetSheetReply,
  getSheetReplySchema,
  ListSheetsReply,
  listSheetsReplySchema,
  SheetParams,
  sheetParamsSchema,
  TestParams,
  testParamsSchema,
} from 'greatest-api-schemas';
import { WithoutId } from 'mongodb';
import { nanoid } from 'nanoid';
import { DbManager } from '../../database/database';
import { requireAuthentication, requireTest } from '../../guards';
import { DbSheet, DbTest } from '../../database/types';
import { mapTimes, randomInt } from '../../utils';
import { getRandomString } from '../../string-generator';
import { mapSheet } from '../../mappers';
import { WebsocketBus } from '../../websocket-bus';

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
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);
    if (test.questions.length !== request.body.questionVariants.length) {
      throw apiInstance.httpErrors.badRequest(
        `Wrong number of question variants, expected ${test.questions.length}`,
      );
    }
    const newSheet: WithoutId<DbSheet> = {
      testId: test._id,
      shortId: nanoid(10),
      pages: null,
      phrase: generatePhrase(),
      student: request.body.student ?? '',
      questions: request.body.questionVariants.map((variant, questionIndex) => {
        if (variant >= test.questions[questionIndex].variants.length) {
          throw apiInstance.httpErrors.badRequest(
            `Variant specified in question ${questionIndex} does not exist`,
          );
        }
        return ({
          variant,
          points: null,
        });
      }),
    };
    await dbManager.sheetsCollection.insertOne(newSheet);
    websocketBus.sheetCreate.emit(newSheet, request.body.requestId);
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
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);
    const sheets = mapTimes<WithoutId<DbSheet>>(() => ({
      shortId: nanoid(10),
      testId: test._id,
      pages: null,
      phrase: generatePhrase(),
      student: '',
      questions: test.questions.map((question) => ({
        variant: randomInt(question.variants.length),
        points: null,
      })),
    }), request.body.count);
    await dbManager.sheetsCollection.insertMany(sheets);
    sheets.forEach((sheet) => websocketBus.sheetCreate.emit(sheet, request.body.requestId));
    return {
      newSheets: sheets.map(mapSheet),
    };
  });

  const getSheet = async (test: DbTest, sheetShortId: string) => {
    const sheet = await dbManager.sheetsCollection.findOne({
      testId: test._id,
      shortId: sheetShortId,
    });
    if (sheet === null) throw apiInstance.httpErrors.notFound('Sheet not found');
    return sheet;
  };

  apiInstance.get<{
    Params: SheetParams,
    Reply: GetSheetReply,
  }>('/tests/:testShortId/sheets/:sheetShortId', {
    schema: {
      params: sheetParamsSchema,
      response: {
        200: getSheetReplySchema,
      },
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);
    return mapSheet(await getSheet(test, request.params.sheetShortId));
  });
}
