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
