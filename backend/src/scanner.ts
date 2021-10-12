import got from 'got';
import FormData from 'form-data';
import { File } from './utils';

export interface ScanResponse {
  codes: string[];
}

export async function scanImage(file: File) {
  const form = new FormData();
  form.append('file', file.data, {
    filename: file.filename,
    contentType: file.mimeType,
  });
  const response = await got.post<ScanResponse>('http://scanner/scan', {
    body: form.getBuffer(),
    headers: form.getHeaders(),
    responseType: 'json',
  });
  return response.body;
}
