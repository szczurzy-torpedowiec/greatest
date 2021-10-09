import ky from 'ky-universal';
import {
  GetViewerReply,
} from 'greatest-api-schemas';

export function getUserInfo() {
  return ky.get('/api/viewer').json<GetViewerReply>();
}

export * from './folders';
export * from './api-tokens';
