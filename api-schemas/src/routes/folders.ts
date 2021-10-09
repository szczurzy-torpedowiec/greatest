import { Static, Type } from '@sinclair/typebox';
import { recursiveRoleSchema, trimmedStringSchema } from '../common';

export const folderSchema = Type.Object({
  shortId: Type.String(),
  name: Type.String(),
});
export type Folder = Static<typeof folderSchema>;
const folderNameSchema = trimmedStringSchema({
  maxLength: 64,
});

export const createFolderBodySchema = Type.Object({
  name: folderNameSchema,
});
export type CreateFolderBody = Static<typeof createFolderBodySchema>;
export const createFolderReplySchema = folderSchema;
export type CreateFolderReply = Static<typeof createFolderReplySchema>;

export const listUserFoldersReplySchema = Type.Object({
  ownedFolders: Type.Array(folderSchema),
  sharedFolders: Type.Array(folderSchema),
});
export type ListUserFoldersReply = Static<typeof listUserFoldersReplySchema>;

export const folderInfoReplySchema = Type.Object({
  subfolders: Type.Array(folderSchema),
  name: Type.String(),
  parentFolderShortId: Type.Union([Type.String(), Type.Null()]),
  viewer: Type.Object({
    isRootAndOwner: Type.Boolean(),
    role: recursiveRoleSchema,
  }),
});
export type FolderInfoReply = Static<typeof folderInfoReplySchema>;

export const imageSchema = Type.Object({
  shortId: Type.String(),
  capturedOn: Type.String({
    format: 'date',
  }),
  uploadedOn: Type.String({
    format: 'date-time',
  }),
});
export type Image = Static<typeof imageSchema>;
export const folderImagesReplySchema = Type.Object({
  images: Type.Array(imageSchema),
});
export type FolderImagesReply = Static<typeof folderImagesReplySchema>;

export const renameFolderBodySchema = Type.Object({
  name: folderNameSchema,
});
export type RenameFolderBody = Static<typeof renameFolderBodySchema>;

export const folderAncestorsReplySchema = Type.Object({
  self: folderSchema,
  ancestors: Type.Array(folderSchema, {
    description: 'In order: parent, grandparent, great-grandparent (...)',
  }),
  isOwner: Type.Boolean(),
});
export type FolderAncestorsReply = Static<typeof folderAncestorsReplySchema>;
