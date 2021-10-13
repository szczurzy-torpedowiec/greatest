import { Static, Type } from '@sinclair/typebox';
import { emptyReplySchema, scanSchema } from '../common';
import { nullable } from '../utility';

export const scanParamsSchema = Type.Object({
  testShortId: Type.String(),
  scanShortId: Type.String(),
});
export type ScanParams = Static<typeof scanParamsSchema>;

export const listScansReplySchema = Type.Object({
  scans: Type.Array(scanSchema),
});
export type ListScansReply = Static<typeof listScansReplySchema>;

export const uploadScanBodySchema = Type.Object({
  requestId: Type.String(),
});
export type UploadScanBody = Static<typeof uploadScanBodySchema>;
export const uploadScanReplySchema = scanSchema;
export type UploadScanReply = Static<typeof uploadScanReplySchema>;
export const uploadScanFiles = ['file'] as const;
export type UploadScanFiles = typeof uploadScanFiles;
export const uploadScanSupportedTypes = ['image/bmp', 'image/jpeg', 'image/png', 'image/webp', 'image/tiff'];

export const patchScanBodySchema = Type.Object({
  sheetShortId: Type.Optional(nullable(Type.String())),
  requestId: Type.String(),
});
export type PatchScanBody = Static<typeof patchScanBodySchema>;
export const patchScanReplySchema = emptyReplySchema;
export type PatchScanReply = Static<typeof patchScanReplySchema>;
