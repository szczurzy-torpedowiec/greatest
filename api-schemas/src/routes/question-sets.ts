import { Static, Type } from '@sinclair/typebox';
import { emptyReplySchema, trimmedStringSchema } from '../common';

export const questionSetParamsSchema = Type.Object({
  setShortId: Type.String(),
});
export type QuestionSetParams = Static<typeof questionSetParamsSchema>;

export const questionParamsSchema = Type.Intersect([
  questionSetParamsSchema,
  Type.Object({
    questionShortId: Type.String(),
  }),
]);
export type QuestionParams = Static<typeof questionParamsSchema>;

export const questionVariantParamsSchema = Type.Intersect([
  questionParamsSchema,
  Type.Object({
    variantShortId: Type.String(),
  }),
]);
export type QuestionVariantParams = Static<typeof questionVariantParamsSchema>;

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

export const deleteQuestionSetReplySchema = emptyReplySchema;
export type DeleteQuestionSetReply = Static<typeof deleteQuestionSetReplySchema>;

const questionSchema = Type.Union([
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
export type Question = Static<typeof questionSchema>;
const questionVariantOpenSchema = Type.Object({
  shortId: Type.String(),
  content: Type.String(),
});
export type QuestionVariantOpen = Static<typeof questionVariantOpenSchema>;
const questionVariantQuizSchema = Type.Object({
  shortId: Type.String(),
  content: Type.String(),
  correctAnswer: Type.String(),
  incorrectAnswers: Type.Array(Type.String()),
});
export type QuestionVariantQuiz = Static<typeof questionVariantQuizSchema>;
export const questionWithIdsSchema = Type.Union([
  Type.Object({
    type: Type.Literal('quiz'),
    shortId: Type.String(),
    maxPoints: Type.Integer({ minimum: 0 }),
    variants: Type.Array(questionVariantQuizSchema),
  }),
  Type.Object({
    shortId: Type.String(),
    type: Type.Literal('open'),
    maxPoints: Type.Integer({ minimum: 0 }),
    variants: Type.Array(questionVariantOpenSchema),
  }),
]);
export type QuestionWithIds = Static<typeof questionWithIdsSchema>;

export const getQuestionSetReplySchema = Type.Object({
  questions: Type.Array(questionWithIdsSchema),
  name: Type.String(),
});
export type GetQuestionSetReply = Static<typeof getQuestionSetReplySchema>;

export const createQuestionBodySchema = questionSchema;
export type CreateQuestionBody = Static<typeof createQuestionBodySchema>;
export const createQuestionReplySchema = questionWithIdsSchema;
export type CreateQuestionReply = Static<typeof createQuestionSetReplySchema>;

export const getQuestionReplySchema = questionWithIdsSchema;
export type GetQuestionReply = Static<typeof getQuestionReplySchema>;

export const patchQuestionBodySchema = Type.Object({
  maxPoints: Type.Optional(Type.Integer({ minimum: 0 })),
});
export type PatchQuestionBody = Static<typeof patchQuestionBodySchema>;
export const patchQuestionReplySchema = emptyReplySchema;
export type PatchQuestionReply = Static<typeof patchQuestionSetReplySchema>;

export const deleteQuestionReplySchema = emptyReplySchema;
export type DeleteQuestionReply = Static<typeof deleteQuestionReplySchema>;

export const createQuestionVariantBodySchema = Type.Union([
  Type.Object({
    type: Type.Literal('quiz', {
      description: 'The API cannot change the type',
    }),
    content: Type.String(),
    correctAnswer: Type.String(),
    incorrectAnswers: Type.Array(Type.String()),
  }),
  Type.Object({
    type: Type.Literal('open', {
      description: 'The API cannot change the type',
    }),
    content: Type.String(),
  }),
]);
export type CreateQuestionVariantBody = Static<typeof createQuestionVariantBodySchema>;
export const createQuestionVariantReplySchema = Type.Object({
  shortId: Type.String(),
});
export type CreateQuestionVariantReply = Static<typeof createQuestionVariantReplySchema>;

export const patchQuestionVariantBodySchema = Type.Union([
  Type.Object({
    type: Type.Literal('quiz', {
      description: 'The API cannot change the type',
    }),
    content: Type.Optional(Type.String()),
    correctAnswer: Type.Optional(Type.String()),
    incorrectAnswers: Type.Optional(Type.Array(Type.String())),
  }),
  Type.Object({
    type: Type.Literal('open', {
      description: 'The API cannot change the type',
    }),
    content: Type.Optional(Type.String()),
  }),
]);
export type PatchQuestionVariantBody = Static<typeof patchQuestionVariantBodySchema>;
export const patchQuestionVariantReplySchema = emptyReplySchema;
export type PatchQuestionVariantReply = Static<typeof patchQuestionVariantReplySchema>;

export const deleteQuestionVariantReplySchema = emptyReplySchema;
export type DeleteQuestionVariantReply = Static<typeof deleteQuestionVariantReplySchema>;
