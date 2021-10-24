import { Static, Type } from '@sinclair/typebox';

export const printDataQuestionElementSchema = Type.Union([
  Type.Object({
    elementType: Type.Literal('question'),
    questionType: Type.Literal('open'),
    maxPoints: Type.Integer(),
    variant: Type.Number(),
    variants: Type.Array(Type.Object({
      content: Type.String(),
    })),
  }),
  Type.Object({
    elementType: Type.Literal('question'),
    questionType: Type.Literal('quiz'),
    maxPoints: Type.Integer(),
    variant: Type.Number(),
    variants: Type.Array(Type.Object({
      content: Type.String(),
      answers: Type.Array(Type.String()),
    })),
  }),
]);
export type PrintDataQuestionElement = Static<typeof printDataQuestionElementSchema>;

export const printDataElementSchema = Type.Union([printDataQuestionElementSchema]);
export type PrintDataElement = Static<typeof printDataElementSchema>;

export const printDataQuerySchema = Type.Object({
  token: Type.String(),
});
export type PrintDataQuery = Static<typeof printDataQuerySchema>;
export const printDataReplySchema = Type.Object({
  doubleSided: Type.Boolean(),
  sheets: Type.Array(Type.Object({
    qrCodeId: Type.String(),
    phrase: Type.String(),
    pages: Type.Array(Type.Array(printDataElementSchema)),
  })),
});
export type PrintDataReply = Static<typeof printDataReplySchema>;
