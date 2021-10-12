import { Static, Type } from '@sinclair/typebox';

export const uploadScanBodySchema = Type.Object({});
export type UploadScanBody = Static<typeof uploadScanBodySchema>;
export const uploadScanReplySchema = Type.Object({
  shortId: Type.String(),
});
export type UploadScanReply = Static<typeof uploadScanReplySchema>;
export const uploadScanFiles = ['file'] as const;
export type UploadScanFiles = typeof uploadScanFiles;
export const uploadScanSupportedTypes = ['image/bmp', 'image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
