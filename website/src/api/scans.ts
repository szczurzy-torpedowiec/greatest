import ky from 'ky';
import { PatchScanBody, PatchScanReply } from 'greatest-api-schemas';

export function patchScan(
  testShortId: string,
  sheetShortId: string,
  body: PatchScanBody,
) {
  return ky.patch(`/api/tests/${testShortId}/scans/${sheetShortId}`, { json: body }).json<PatchScanReply>();
}
