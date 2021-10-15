import ky from 'ky';
import {
  CreateRandomSheetsBody, CreateRandomSheetsReply,
  CreateSheetBody,
  CreateSheetReply, DeleteSheetBody, DeleteSheetReply, GetSheetReply,
  ListSheetsReply, PatchSheetBody, PatchSheetReply,
} from 'greatest-api-schemas';

export function listSheets(testShortId: string) {
  return ky.get(`/api/tests/${testShortId}/sheets`).json<ListSheetsReply>();
}

export function createSheet(testShortId: string, body: CreateSheetBody) {
  return ky.post(`/api/tests/${testShortId}/sheets/create`, { json: body }).json<CreateSheetReply>();
}

export function createRandomSheets(testShortId: string, body: CreateRandomSheetsBody) {
  return ky.post(`/api/tests/${testShortId}/sheets/create-random`, { json: body }).json<CreateRandomSheetsReply>();
}

export function getSheet(testShortId: string, sheetShortId: string) {
  return ky.get(`/api/tests/${testShortId}/sheets/${sheetShortId}`).json<GetSheetReply>();
}

export function patchSheet(testShortId: string, sheetShortId: string, body: PatchSheetBody) {
  return ky.patch(`/api/tests/${testShortId}/sheets/${sheetShortId}`, { json: body }).json<PatchSheetReply>();
}

export function deleteSheet(testShortId: string, sheetShortId: string, body: DeleteSheetBody) {
  return ky.delete(`/api/tests/${testShortId}/sheets/${sheetShortId}`, { json: body }).json<DeleteSheetReply>();
}
