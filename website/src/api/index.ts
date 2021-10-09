import { GetViewerReply } from 'greatest-api-schemas';
import ky from 'ky';

export function getViewer() {
  return ky.get('/api/viewer').json<GetViewerReply>();
}

export * from './question-sets';
