import ky from 'ky';
import {
  GenerateTokenBody,
  GenerateTokenReply, ListTokensReply,
  RevokeTokenBody,
} from 'greatest-api-schemas';

export function listApiTokens() {
  return ky.get('/api/api-tokens/list').json<ListTokensReply>();
}

export function generateApiToken(name: string) {
  const body: GenerateTokenBody = {
    name,
  };
  return ky.post('/api/api-tokens/generate', { json: body }).json<GenerateTokenReply>();
}

export async function revokeApiToken(type: 'id' | 'token', value: string) {
  const body: RevokeTokenBody = {
    type,
    value,
  };
  await ky.post('/api/api-tokens/revoke', { json: body });
}
