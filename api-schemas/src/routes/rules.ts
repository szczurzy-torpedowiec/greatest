import { Static, Type } from '@sinclair/typebox';
import { recursiveRoleSchema, roleSchema } from '../common';
import { nullable } from '../utility';

export const getRuleItemSchema = Type.Object({
  email: Type.String({
    format: 'idn-email',
  }),
  role: roleSchema,
});
export type GetRuleItem = Static<typeof getRuleItemSchema>;

export const getRulesReplySchema = Type.Object({
  rules: Type.Array(getRuleItemSchema),
});
export type GetRulesReply = Static<typeof getRulesReplySchema>;

export const modifyRulesBodySchema = Type.Object({
  changes: Type.Record(Type.String({
    format: 'idn-email',
  }), nullable(roleSchema)),
});
export type ModifyRulesBody = Static<typeof modifyRulesBodySchema>;
export const modifyRulesReplySchema = Type.Object({
  viewerNewRole: nullable(recursiveRoleSchema),
});
export type ModifyRulesReply = Static<typeof modifyRulesReplySchema>;
