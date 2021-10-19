import ky from 'ky';
import { ListScansReply, PatchScanBody, PatchScanReply } from 'greatest-api-schemas';

export function listScans(testShortId: string) {
  return ky.get(`/api/tests/${testShortId}/scans`).json<ListScansReply>();
}

export function patchScan(
  testShortId: string,
  sheetShortId: string,
  body: PatchScanBody,
) {
  return ky.patch(`/api/tests/${testShortId}/scans/${sheetShortId}`, { json: body }).json<PatchScanReply>();
}

export function getScanImageUrl(
  testShortId: string,
  sheetShortId: string,
) {
  return `/api/tests/${testShortId}/scans/${sheetShortId}.webp`;
}
