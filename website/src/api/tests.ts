import {
  CreateTestBody,
  CreateTestReply, ListTestsReply,
} from 'greatest-api-schemas';
import ky from 'ky';

export function listTests() {
  return ky.get('/api/tests/list').json<ListTestsReply>();
}

export function createTest(body: CreateTestBody) {
  return ky.post('/api/tests/create', { json: body }).json<CreateTestReply>();
}
