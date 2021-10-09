import { FastifyRequest } from 'fastify';
import Busboy from 'busboy';
import { IncomingMessage } from 'http';

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined) throw new Error(`Env variable "${name}" not set`);
  return value;
}

export interface File {
  filename: string;
  data: Buffer;
  mimeType: string;
}

export interface MultipartBody {
  files: Partial<Record<string, File>>;
  fields: Partial<Record<string, unknown>>;
}

export function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Array<any> = [];
    stream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    stream.on('error', (error) => {
      reject(error);
    });
    stream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}

export function parseMultipart(
  request: FastifyRequest,
  payload: IncomingMessage,
): Promise<MultipartBody> {
  return new Promise<MultipartBody>((resolve) => {
    const busboy = new Busboy({
      headers: request.headers,
    });
    const files: Record<string, File> = {};
    const fields: Record<string, unknown> = {};
    busboy.on('file', async (fieldName, stream, filename, encoding, mimeType) => {
      files[fieldName] = {
        data: await streamToBuffer(stream),
        filename,
        mimeType,
      };
    });
    busboy.on('field', (fieldName, value: unknown) => {
      fields[fieldName] = value;
    });
    busboy.on('finish', () => {
      resolve({
        files,
        fields,
      });
    });
    payload.pipe(busboy);
  });
}

export function mapObject<T, R, K extends string>(
  obj: Record<K, T>,
  f: (value: T, key: K) => R,
): Record<K, R> {
  return Object.fromEntries(
    Object.entries<T>(obj).map(([key, value]) => [key, f(value, key as K)]),
  ) as Record<K, R>;
}
