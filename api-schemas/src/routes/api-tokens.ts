import { Static, Type } from '@sinclair/typebox';
import { emptyReplySchema, trimmedStringSchema } from '../common';

const tokenNameSchema = trimmedStringSchema(false, {
  maxLength: 64,
});

export const tokenSchema = Type.Object({
  tokenId: Type.String(),
  name: Type.String(),
  createdOn: Type.String({
    format: 'date-time',
  }),
});
export type Token = Static<typeof tokenSchema>;
export const revealedTokenSchema = Type.Intersect([
  tokenSchema,
  Type.Object({
    token: Type.String(),
  }),
]);
export type RevealedToken = Static<typeof revealedTokenSchema>;

export const generateTokenBodySchema = Type.Object({
  name: tokenNameSchema,
});
export type GenerateTokenBody = Static<typeof generateTokenBodySchema>;
export const generateTokenReplySchema = revealedTokenSchema;
export type GenerateTokenReply = Static<typeof generateTokenReplySchema>;

export const listTokensReplySchema = Type.Object({
  tokens: Type.Array(tokenSchema),
});
export type ListTokensReply = Static<typeof listTokensReplySchema>;

export const revokeTokenBodySchema = Type.Union([
  Type.Object({
    type: Type.Literal('id'),
    value: Type.String({
      pattern: '^[A-Za-z0-9_-]+$',
    }),
  }),
  Type.Object({
    type: Type.Literal('token'),
    value: Type.String({
      pattern: '^[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$',
    }),
  }),
]);
export type RevokeTokenBody = Static<typeof revokeTokenBodySchema>;
export const revokeTokenReplySchema = emptyReplySchema;
export type RevokeTokenReply = Static<typeof revokeTokenReplySchema>;
