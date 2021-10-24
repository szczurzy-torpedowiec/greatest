import { FastifyInstance } from 'fastify';
import {
  CheckStudentReply,
  checkStudentReplySchema,
  GetStudentSheetReply,
  getStudentSheetReplySchema, StudentQuery, studentQuerySchema,
} from 'greatest-api-schemas';
import { DbManager } from '../../database/database';
import { mapTestQuestions } from '../../mappers';

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

  apiInstance.post<{
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
    return {
      questions: sheet.questions.map((sheetQuestion, index) => ({
        points: sheetQuestion.points,
        maxPoints: testQuestions[index].maxPoints,
      })),
    };
  });
}
