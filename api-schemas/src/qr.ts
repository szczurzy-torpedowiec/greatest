import { Static, Type } from '@sinclair/typebox';

export const getSheetQrCodeParamsSchema = Type.Object({
  qrCodeId: Type.String(),
  page: Type.Integer(),
});
export type GetSheetQrCodeParams = Static<typeof getSheetQrCodeParamsSchema>;
