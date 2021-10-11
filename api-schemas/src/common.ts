import { Static, StringOptions, Type } from '@sinclair/typebox';
import { nullable } from './utility';

export const emptyReplySchema = Type.Object({});

export const binarySchema = Type.String({
  format: 'binary',
});
export function trimmedStringSchema<TFormat extends string>(
  allowEmpty: boolean,
  options: StringOptions<TFormat> = {},
) {
  return Type.String({
    pattern: allowEmpty ? '^\\(S(.*\\S)?)?$' : '^\\S(.*\\S)?$',
    ...options,
  });
}

export const sheetSchema = Type.Object({
  shortId: Type.String(),
  student: Type.String({
    description: 'Might be empty',
  }),
  questions: Type.Array(Type.Object({
    variant: Type.Integer(),
    points: nullable(Type.Integer()),
  })),
});
export type Sheet = Static<typeof sheetSchema>;
