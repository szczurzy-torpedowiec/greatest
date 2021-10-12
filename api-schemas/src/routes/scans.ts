import { Static, Type } from '@sinclair/typebox';
import { scanSchema } from '../common';

export const uploadScanBodySchema = Type.Object({
  requestId: Type.String(),
});
export type UploadScanBody = Static<typeof uploadScanBodySchema>;
export const uploadScanReplySchema = scanSchema;
export type UploadScanReply = Static<typeof uploadScanReplySchema>;
export const uploadScanFiles = ['file'] as const;
export type UploadScanFiles = typeof uploadScanFiles;
export const uploadScanSupportedTypes = ['image/bmp', 'image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
