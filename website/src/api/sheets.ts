import ky from 'ky';
import {
  CreateRandomSheetsBody,
  CreateSheetBody,
  CreateSheetReply, GetSheetReply,
  ListSheetsReply,
} from 'greatest-api-schemas';

export function listSheets(testShortId: string) {
  return ky.get(`/api/tests/${testShortId}/`).json<ListSheetsReply>();
}

export function createSheet(testShortId: string, body: CreateSheetBody) {
  return ky.post(`/api/tests/${testShortId}/sheets/create`, { json: body }).json<CreateSheetReply>();
}

export function createRandomSheets(testShortId: string, count: number) {
  const body: CreateRandomSheetsBody = {
    count,
  };
  return ky.post(`/api/tests/${testShortId}/sheets/create-random`, { json: body }).json<CreateRandomSheetsBody>();
}

export function getSheet(testShortId: string, sheetShortId: string) {
  return ky.get(`/api/tests/${testShortId}/sheets/${sheetShortId}`).json<GetSheetReply>();
}
