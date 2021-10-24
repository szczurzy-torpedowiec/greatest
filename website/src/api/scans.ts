import ky from 'ky';
import {
  ListScansReply,
  PatchScanBody,
  PatchScanReply,
  UploadScanBody,
  UploadScanReply,
} from 'greatest-api-schemas';
import { uid } from 'quasar';

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

export function uploadScan(
  testShortId: string,
  file: string,
) {
  const formData = new FormData();
  formData.append('requestId', uid());
  formData.append('file', file);
  return ky.post(`/api/tests/${testShortId}/scans/upload`, { body: formData }).json<UploadScanReply>();
}
