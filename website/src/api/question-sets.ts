import {
  CreateQuestionBody, CreateQuestionReply,
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

export function patchQuestionSet(setShortId: string, body: PatchQuestionSetBody) {
  return ky.post(`/api/question-sets/${setShortId}`, { json: body }).json<PatchQuestionSetReply>();
}

export function createQuestion(setShortId: string, body: CreateQuestionBody) {
  return ky.post(`/api/question-sets/${setShortId}/questions/create`, { json: body }).json<CreateQuestionReply>();
}
