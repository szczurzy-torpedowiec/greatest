import { Static, Type } from '@sinclair/typebox';
import { emptyReplySchema, sheetSchema, trimmedStringSchema } from '../common';
import { nullable } from '../utility';

export const createSheetBodySchema = Type.Object({
  questionVariants: Type.Array(Type.Integer({ minimum: 0 }), {
    minItems: 1,
  }),
  student: Type.Optional(trimmedStringSchema(true)),
  requestId: Type.String(),
});
export type CreateSheetBody = Static<typeof createSheetBodySchema>;
export const createSheetReplySchema = sheetSchema;
export type CreateSheetReply = Static<typeof createSheetReplySchema>;

export const sheetParamsSchema = Type.Object({
  testShortId: Type.String(),
  sheetShortId: Type.String(),
});
export type SheetParams = Static<typeof sheetParamsSchema>;

export const createRandomSheetsBodySchema = Type.Object({
  count: Type.Integer({
    minimum: 0,
  }),
  requestId: Type.String(),
});
export type CreateRandomSheetsBody = Static<typeof createRandomSheetsBodySchema>;
export const createRandomSheetsReplySchema = Type.Object({
  newSheets: Type.Array(sheetSchema),
});
export type CreateRandomSheetsReply = Static<typeof createRandomSheetsReplySchema>;

export const listSheetsReplySchema = Type.Object({
  sheets: Type.Array(sheetSchema),
});
export type ListSheetsReply = Static<typeof listSheetsReplySchema>;

export const getSheetReplySchema = sheetSchema;
export type GetSheetReply = Static<typeof getSheetReplySchema>;

export const patchSheetBodySchema = Type.Object({
  student: Type.Optional(trimmedStringSchema(true)),
  questions: Type.Optional(Type.Array(Type.Object({
    index: Type.Integer({ minimum: 0 }),
    points: Type.Optional(nullable(Type.Integer({ minimum: 0 }))),
  }))),
  requestId: Type.String(),
});
export type PatchSheetBody = Static<typeof patchSheetBodySchema>;
export const patchSheetReplySchema = emptyReplySchema;
export type PatchSheetReply = Static<typeof patchSheetReplySchema>;

export const deleteSheetBodySchema = Type.Object({
  requestId: Type.String(),
});
export type DeleteSheetBody = Static<typeof deleteSheetBodySchema>;
export const deleteSheetReplySchema = emptyReplySchema;
export type DeleteSheetReply = Static<typeof deleteSheetReplySchema>;

export const printSheetsBodySchema = Type.Object({
  doubleSided: Type.Boolean(),
  sheetShortIds: Type.Array(Type.String()),
});
export type PrintSheetsBody = Static<typeof printSheetsBodySchema>;
export const printSheetsReplySchema = Type.Object({
  token: Type.String(),
});
export type PrintSheetsReply = Static<typeof printSheetsReplySchema>;
