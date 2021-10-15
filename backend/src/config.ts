import fse from 'fs-extra';
import { requireBooleanEnv, requireEnv } from './utils';

export const config = {
  port: requireEnv('PORT'),
  mongodbUrl: 'mongodb://mongodb:27017/greatest',
  baseUrl: requireEnv('BASE_URL'),
  development: requireEnv('SERVER_MODE') === 'development',
  qrOrigin: requireEnv('QR_ORIGIN'),
  allowDemoLogin: requireBooleanEnv('ALLOW_DEMO_LOGIN'),
};

export interface GoogleKeys {
  web: {
    'client_id': string,
    'project_id': string,
    'auth_uri': string,
    'token_uri': string,
    'auth_provider_x509_cert_url': string,
    'client_secret': string,
    'redirect_uris': string[];
  }
}

export function getGoogleKeys(): Promise<GoogleKeys> {
  return fse.readJSON('/run/secrets/google-keys');
}
