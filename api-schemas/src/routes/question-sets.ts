import { Static, Type } from '@sinclair/typebox';
import { trimmedStringSchema } from '../common';

export const createQuestionSetBodySchema = Type.Object({
  name: trimmedStringSchema(),
});
export type CreateQuestionSetBody = Static<typeof createQuestionSetBodySchema>;
export const createQuestionSetReplySchema = Type.Object({
  shortId: Type.String(),
});
export type CreateQuestionSetReply = Static<typeof createQuestionSetReplySchema>;
