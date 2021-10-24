import { FastifyInstance } from 'fastify';
import {
  binarySchema,
  CheckStudentReply,
  checkStudentReplySchema, GetStudentScanParams, getStudentScanParamsSchema,
  GetStudentSheetReply,
  getStudentSheetReplySchema, StudentQuery, studentQuerySchema,
} from 'greatest-api-schemas';
import fse from 'fs-extra';
import { DbManager } from '../../database/database';
import { mapTestQuestions } from '../../mappers';
import { getScanPath } from '../../utils';

export function registerStudent(apiInstance: FastifyInstance, dbManager: DbManager) {
  apiInstance.get<{
    Querystring: StudentQuery,
    Reply: CheckStudentReply,
  }>('/student/check', {
    schema: {
      querystring: studentQuerySchema,
      response: {
        200: checkStudentReplySchema,
      },
    },
  }, async (request) => {
    const sheet = await dbManager.sheetsCollection.findOne({
      phrase: request.query.phrase,
    });
    return {
      found: sheet !== null,
    };
  });

  apiInstance.get<{
    Querystring: StudentQuery,
    Reply: GetStudentSheetReply,
  }>('/student/sheet', {
    schema: {
      querystring: studentQuerySchema,
      response: {
        200: getStudentSheetReplySchema,
      },
    },
  }, async (request) => {
    const sheet = await dbManager.sheetsCollection.findOne({
      phrase: request.query.phrase,
    });
    if (sheet === null) throw apiInstance.httpErrors.notFound('Sheet not found');
    const test = await dbManager.testsCollection.findOne({
      _id: sheet.testId,
    });
    if (test === null) throw apiInstance.httpErrors.internalServerError('Test not found');
    const testQuestions = mapTestQuestions(test);
    const scans = await dbManager.scansCollection.find({
      testId: test._id,
      'sheet.id': sheet._id,
    }).map((scan) => ({
      shortId: scan.shortId,
      page: scan.sheet!.page,
    })).toArray();
    return {
      testName: test.name,
      student: sheet.student,
      questions: sheet.questions.map((sheetQuestion, index) => ({
        points: sheetQuestion.points,
        maxPoints: testQuestions[index].maxPoints,
      })),
      scans,
    };
  });

  apiInstance.get<{
    Querystring: StudentQuery,
    Params: GetStudentScanParams,
  }>('/student/scans/:scanShortId.webp', {
    schema: {
      params: getStudentScanParamsSchema,
      querystring: studentQuerySchema,
      produces: ['image/webp'],
      response: {
        200: binarySchema,
      },
    },
  }, async (request, reply) => {
    const sheet = await dbManager.sheetsCollection.findOne({
      phrase: request.query.phrase,
    });
    if (sheet === null) throw apiInstance.httpErrors.notFound('Sheet not found');
    const scan = await dbManager.scansCollection.findOne({
      'sheet.id': sheet._id,
    });
    if (scan === null) throw apiInstance.httpErrors.notFound('Scan not found');
    reply
      .type('image/webp')
      .send(fse.createReadStream(getScanPath(scan.imageFilename)));
  });
}
