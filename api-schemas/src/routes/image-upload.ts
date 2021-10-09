import { Static, Type } from '@sinclair/typebox';
import { imageSchema } from './folders';

export const uploadImageBodySchema = Type.Object({
  capturedOn: Type.String({
    format: 'date',
  }),
});
export type UploadImageBody = Static<typeof uploadImageBodySchema>;
export const uploadImageReplySchema = imageSchema;
export type UploadImageReply = Static<typeof uploadImageReplySchema>;
