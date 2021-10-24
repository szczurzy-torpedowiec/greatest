import { CreateDemoUserReply, GetViewerReply } from 'greatest-api-schemas';
import ky from 'ky';

export function getViewer() {
  return ky.get('/api/viewer').json<GetViewerReply>();
}

export function createDemoUser() {
  return ky.post('/auth/create-demo-user').json<CreateDemoUserReply>();
}

export * from './question-sets';
export * from './scans';
export * from './tests';
export * from './sheets';
export * from './api-tokens';
export * from './print';
