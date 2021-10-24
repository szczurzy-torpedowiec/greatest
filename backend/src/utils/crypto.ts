import crypto from 'crypto';
import base64url from 'base64url';

export function createKey(): Buffer {
  return crypto.randomBytes(32);
}

export function encryptSymmetrical(value: unknown, key: Buffer): string {
  const ivBuffer = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, ivBuffer);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()]);
  return `${base64url.encode(encrypted)}.${base64url.encode(ivBuffer)}`;
}

export function decryptSymmetrical<T>(encrypted: string, key: Buffer): T {
  const [encryptedData, iv] = encrypted.split('.');
  const ivBuffer = base64url.toBuffer(iv);
  const encryptedBuffer = base64url.toBuffer(encryptedData);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);
  const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  return JSON.parse(decrypted.toString()) as T;
}
