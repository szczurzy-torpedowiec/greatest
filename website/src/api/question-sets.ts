import {
  CreateQuestionBody,
  CreateQuestionReply,
  CreateQuestionSetBody,
  CreateQuestionSetReply,
  CreateQuestionVariantBody,
  CreateQuestionVariantReply, DeleteQuestionReply, DeleteQuestionVariantReply,
  GetQuestionSetReply,
  ListQuestionSetsReply,
  PatchQuestionBody,
  PatchQuestionReply,
  PatchQuestionSetBody,
  PatchQuestionSetReply,
  PatchQuestionVariantBody,
  PatchQuestionVariantReply,
} from 'greatest-api-schemas';
import ky from 'ky';

export function createQuestionSet(body: CreateQuestionSetBody) {
  return ky.post('/api/question-sets/create', { json: body }).json<CreateQuestionSetReply>();
}

export function listQuestionSets() {
  return ky.get('/api/question-sets/list').json<ListQuestionSetsReply>();
}

export function getQuestionSet(setShortId: string) {
  return ky.get(`/api/question-sets/${setShortId}`).json<GetQuestionSetReply>();
}

export function patchQuestionSet(setShortId: string, body: PatchQuestionSetBody) {
  return ky.post(`/api/question-sets/${setShortId}`, { json: body }).json<PatchQuestionSetReply>();
}

export function createQuestion(setShortId: string, body: CreateQuestionBody) {
  return ky.post(`/api/question-sets/${setShortId}/questions/create`, { json: body }).json<CreateQuestionReply>();
}

export function patchQuestion(
  setShortId: string,
  questionShortId: string,
  body: PatchQuestionBody,
) {
  return ky.patch(`/api/question-sets/${setShortId}/questions/${questionShortId}`, {
    json: body,
  }).json<PatchQuestionReply>();
}

export function deleteQuestion(
  setShortId: string,
  questionShortId: string,
) {
  return ky.patch(`/api/question-sets/${setShortId}/questions/${questionShortId}`).json<DeleteQuestionReply>();
}

export function createQuestionVariant(
  setShortId: string,
  questionShortId: string,
  body: CreateQuestionVariantBody,
) {
  return ky.post(`/api/question-sets/${setShortId}/questions/${questionShortId}/variants/create`, {
    json: body,
  }).json<CreateQuestionVariantReply>();
}

export function patchQuestionVariant(
  setShortId: string,
  questionShortId: string,
  variantShortId: string,
  body: PatchQuestionVariantBody,
) {
  return ky.patch(`/api/question-sets/${setShortId}/questions/${questionShortId}/variants/${variantShortId}`, {
    json: body,
  }).json<PatchQuestionVariantReply>();
}

export function deleteQuestionVariant(
  setShortId: string,
  questionShortId: string,
  variantShortId: string,
) {
  return ky.delete(`/api/question-sets/${setShortId}/questions/${questionShortId}/variants/${variantShortId}`).json<DeleteQuestionVariantReply>();
}
