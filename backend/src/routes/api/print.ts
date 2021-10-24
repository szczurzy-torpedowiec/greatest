import { FastifyInstance } from 'fastify';
import {
  PrintDataQuestionElement,
  PrintDataQuery, printDataQuerySchema,
  PrintDataReply, printDataReplySchema,
} from 'greatest-api-schemas';
import { DbManager } from '../../database/database';
import { PrintTokenBody } from '../../types';
import { decryptSymmetrical } from '../../utils';
import { config } from '../../config';

export function registerPrint(apiInstance: FastifyInstance, dbManager: DbManager) {
  apiInstance.get<{
    Querystring: PrintDataQuery,
    Reply: PrintDataReply,
  }>('/print-data', {
    schema: {
      querystring: printDataQuerySchema,
      response: {
        200: printDataReplySchema,
      },
    },
  }, async (request) => {
    let tokenBody: PrintTokenBody;
    try {
      tokenBody = decryptSymmetrical<PrintTokenBody>(request.query.token, config.printTokenKey);
    } catch (error) {
      apiInstance.log.error(error);
      throw apiInstance.httpErrors.badRequest('Invalid token');
    }
    const test = await dbManager.testsCollection.findOne({
      shortId: tokenBody.testShortId,
    });
    if (test === null) throw apiInstance.httpErrors.internalServerError('Test not found');
    return {
      doubleSided: tokenBody.doubleSided,
      sheets: await Promise.all(tokenBody.sheetShortIds.map(async (sheetShortId) => {
        const sheet = await dbManager.sheetsCollection.findOne({
          shortId: sheetShortId,
          testId: test._id,
        });
        if (sheet === null) throw apiInstance.httpErrors.internalServerError('Sheet not found');
        let questionNumber = 0;
        return ({
          qrCodeId: sheet.qrCodeId,
          phrase: sheet.phrase,
          pages: test.pages.map((page) => page.map((dbElement) => {
            switch (dbElement.elementType) {
              case 'question': {
                const sheetQuestion = sheet.questions[questionNumber];
                const elementBase = {
                  elementType: 'question',
                  variant: sheetQuestion.variant,
                  maxPoints: dbElement.maxPoints,
                  questionIndex: questionNumber,
                } as const;
                let element: PrintDataQuestionElement;
                switch (dbElement.questionType) {
                  case 'open': {
                    if (sheetQuestion.type !== 'open') throw apiInstance.httpErrors.internalServerError('Invalid sheet question type');
                    element = {
                      ...elementBase,
                      questionType: 'open',
                      variants: dbElement.variants.map((variant) => ({
                        ...variant,
                        type: 'open',
                      })),
                    };
                    break;
                  }
                  case 'quiz': {
                    if (sheetQuestion.type !== 'quiz') throw apiInstance.httpErrors.internalServerError('Invalid sheet question type');
                    element = {
                      ...elementBase,
                      questionType: 'quiz',
                      variants: dbElement.variants.map((dbVariant, variantIndex) => {
                        const variantBase = {
                          type: 'quiz',
                          content: dbVariant.content,
                        } as const;
                        if (variantIndex !== sheetQuestion.variant) {
                          return {
                            ...variantBase,
                            answers: [dbVariant.correctAnswer, ...dbVariant.incorrectAnswers],
                          };
                        }
                        return {
                          ...variantBase,
                          answers: sheetQuestion.answerOrder.map(
                            (answerIndex) => (answerIndex === null
                              ? dbVariant.correctAnswer
                              : dbVariant.incorrectAnswers[answerIndex]),
                          ),
                        };
                      }),
                    };
                    break;
                  }
                }
                questionNumber += 1;
                return element;
              }
            }
          })),
        });
      })),
    };
  });
}
