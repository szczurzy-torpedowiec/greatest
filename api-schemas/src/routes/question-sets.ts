import { Static, Type } from '@sinclair/typebox';
import { emptyReplySchema, trimmedStringSchema } from '../common';

export const questionSetParamsSchema = Type.Object({
  setShortId: Type.String(),
});
export type QuestionSetParams = Static<typeof questionSetParamsSchema>;

export const createQuestionSetBodySchema = Type.Object({
  name: trimmedStringSchema(),
});
export type CreateQuestionSetBody = Static<typeof createQuestionSetBodySchema>;
export const createQuestionSetReplySchema = Type.Object({
  shortId: Type.String(),
});
export type CreateQuestionSetReply = Static<typeof createQuestionSetReplySchema>;

export const questionSetSchema = Type.Object({
  shortId: Type.String(),
  name: Type.String(),
  questionCount: Type.Integer(),
});
export type QuestionSet = Static<typeof questionSetSchema>;

export const listQuestionSetsReplySchema = Type.Object({
  questionSets: Type.Array(questionSetSchema),
});
export type ListQuestionSetsReply = Static<typeof listQuestionSetsReplySchema>;

export const patchQuestionSetBodySchema = Type.Partial(Type.Object({
  name: trimmedStringSchema(),
}));
export type PatchQuestionSetBody = Static<typeof patchQuestionSetBodySchema>;
export const patchQuestionSetReplySchema = emptyReplySchema;
export type PatchQuestionSetReply = Static<typeof patchQuestionSetReplySchema>;

export const createQuestionBodySchema = Type.Union([
  Type.Object({
    type: Type.Literal('quiz'),
    maxPoints: Type.Integer({ minimum: 0 }),
    variants: Type.Array(Type.Object({
      content: Type.String(),
      correctAnswer: Type.String(),
      incorrectAnswers: Type.Array(Type.String()),
    })),
  }),
  Type.Object({
    type: Type.Literal('open'),
    maxPoints: Type.Integer({ minimum: 0 }),
    variants: Type.Array(Type.Object({
      content: Type.String(),
    })),
  }),
]);
export type CreateQuestionBody = Static<typeof createQuestionBodySchema>;
export const createQuestionReplySchema = Type.Object({
  shortId: Type.String(),
});
export type CreateQuestionReply = Static<typeof createQuestionSetReplySchema>;
