import { FastifyRequest } from 'fastify';
import Busboy from 'busboy';
import { IncomingMessage } from 'http';

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
