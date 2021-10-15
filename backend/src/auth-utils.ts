import { OAuth2Client } from 'google-auth-library';
import { config, getGoogleKeys } from './config';
import { DbUserGoogle } from './database/types';

const keysPromise = getGoogleKeys();

export async function getAuthClient() {
  const keys = await keysPromise;
  return new OAuth2Client(
    keys.web.client_id,
    keys.web.client_secret,
    new URL('/auth/google-callback', config.baseUrl).toString(),
  );
}

interface UserInfo {
  id: string,
  email: string,
  verified_email: boolean,
  name: string,
  given_name: string,
  family_name: string,
  picture: string,
  locale: string
}
const userInfoCache = new Map<string, {
  expires: Date,
  info: UserInfo,
}>();
export async function getGoogleUserInfo(user: DbUserGoogle, withCache: boolean): Promise<UserInfo> {
  if (withCache) {
    const cached = userInfoCache.get(user._id.toHexString());
    if (cached !== undefined && new Date() < cached.expires) return cached.info;
  }
  const client = await getAuthClient();
  client.setCredentials({
    refresh_token: user.googleRefreshToken,
  });
  const { data } = await client.request<UserInfo>({
    url: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
  });
  userInfoCache.set(user._id.toHexString(), {
    expires: new Date(Date.now() + 1000 * 60 * 15),
    info: data,
  });
  return data;
}
