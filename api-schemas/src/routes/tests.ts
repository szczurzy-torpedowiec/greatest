import { Static, Type } from '@sinclair/typebox';
import { emptyReplySchema, trimmedStringSchema } from '../common';

export const testParamsSchema = Type.Object({
  testShortId: Type.String(),
});
export type TestParams = Static<typeof testParamsSchema>;

export const listTestsReplySchema = Type.Object({
  tests: Type.Array(Type.Object({
    shortId: Type.String(),
    name: Type.String(),
    createdOn: Type.String({
      format: 'date-time',
    }),
  })),
});
export type ListTestsReply = Static<typeof listTestsReplySchema>;

export const createTestBodySchema = Type.Object({
  name: trimmedStringSchema(false),
  questions: Type.Array(Type.Object({
    questionSetShortId: Type.String(),
    questionShortId: Type.String(),
    variants: Type.Array(Type.String({
      title: 'Question variant short id',
    }), {
      minItems: 1,
      maxItems: 26,
      uniqueItems: true,
    }),
  }), {
    minItems: 1,
  }),
});
export type CreateTestBody = Static<typeof createTestBodySchema>;
export const createTestReplySchema = Type.Object({
  shortId: Type.String(),
  createdOn: Type.String({
    format: 'date-time',
  }),
});
export type CreateTestReply = Static<typeof createTestReplySchema>;

export const patchTestBodySchema = Type.Object({
  name: Type.Optional(trimmedStringSchema(false)),
});
export type PatchTestBody = Static<typeof patchTestBodySchema>;
export const patchTestReplySchema = emptyReplySchema;
export type PatchTestReply = Static<typeof patchTestReplySchema>;

export const getTestReplySchema = Type.Object({
  name: Type.String(),
  questions: Type.Array(Type.Union([
    Type.Object({
      type: Type.Literal('open'),
      maxPoints: Type.Integer(),
      variants: Type.Array(Type.Object({
        content: Type.String(),
      })),
    }),
    Type.Object({
      type: Type.Literal('quiz'),
      maxPoints: Type.Integer(),
      variants: Type.Array(Type.Object({
        content: Type.String(),
        correctAnswer: Type.String(),
        incorrectAnswers: Type.Array(Type.String()),
      })),
    }),
  ])),
});
export type GetTestReply = Static<typeof getTestReplySchema>;
