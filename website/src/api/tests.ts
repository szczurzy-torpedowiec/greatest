import {
  CreateTestBody,
  CreateTestReply, GetTestReply, ListTestsReply, PatchTestBody, PatchTestReply,
} from 'greatest-api-schemas';
import ky from 'ky';

export function listTests() {
  return ky.get('/api/tests/list').json<ListTestsReply>();
}

export function createTest(body: CreateTestBody) {
  return ky.post('/api/tests/create', { json: body }).json<CreateTestReply>();
}

export function getTest(shortId: string) {
  return ky.get(`/api/tests/${shortId}`).json<GetTestReply>();
}

export function patchTest(shortId: string, body: PatchTestBody) {
  return ky.patch(`/api/tests/${shortId}`, { json: body }).json<PatchTestReply>();
}
