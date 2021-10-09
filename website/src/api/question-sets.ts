import {
  CreateQuestionSetBody,
  CreateQuestionSetReply,
  ListQuestionSetsReply, PatchQuestionSetBody, PatchQuestionSetReply,
} from 'greatest-api-schemas';
import ky from 'ky';

export function listQuestionSets() {
  return ky.get('/api/question-sets/list').json<ListQuestionSetsReply>();
}

export function createQuestionSet(body: CreateQuestionSetBody) {
  return ky.post('/api/question-sets/create', { json: body }).json<CreateQuestionSetReply>();
}

export function patchQuestionSet(shortId: string, body: PatchQuestionSetBody) {
  return ky.post(`/api/question-sets/${shortId}`, { json: body }).json<PatchQuestionSetReply>();
}
