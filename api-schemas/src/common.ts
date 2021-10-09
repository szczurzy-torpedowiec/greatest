import { StringOptions, Type } from '@sinclair/typebox';

export const emptyReplySchema = Type.Object({});

export const binarySchema = Type.String({
  format: 'binary',
});
export function trimmedStringSchema<TFormat extends string>(
  options: StringOptions<TFormat> = {},
) {
  return Type.String({
    pattern: '^\\S(.*\\S)?$',
    ...options,
  });
}
