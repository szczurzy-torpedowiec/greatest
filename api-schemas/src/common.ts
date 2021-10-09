import { Static, StringOptions, Type } from '@sinclair/typebox';
import { recursiveRoles, roles } from './data';

export const folderParamsSchema = Type.Object({
  folderShortId: Type.String(),
});
export type FolderParams = Static<typeof folderParamsSchema>;

export const imageParamsSchema = Type.Intersect([
  folderParamsSchema,
  Type.Object({
    imageShortId: Type.String(),
  }),
]);
export type ImageParams = Static<typeof imageParamsSchema>;

export const emptyReplySchema = Type.Object({});
export type EmptyReply = Static<typeof emptyReplySchema>;

export const roleSchema = Type.Union(roles.map((x) => Type.Literal(x)));
export const recursiveRoleSchema = Type.Union(recursiveRoles.map((x) => Type.Literal(x)));

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
