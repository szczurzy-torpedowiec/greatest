import FormData from 'form-data';
import got from 'got';
import { DbManager } from './database/database';
import { DbImageBoard } from './database/types';
import { File } from './utils';

interface AnalyseImageResult {
  points: [number, number][];
  mm_width: number;
  mm_height: number;
  width: number;
  height: number;
}
type AnalyseImageResponse = Record<number, AnalyseImageResult>;

export default async function analyseImage(
  file: File,
  dbManager: DbManager,
  markers: number[][],
): Promise<DbImageBoard[]> {
  const form = new FormData();
  form.append('file', file.data, {
    filename: file.filename,
    contentType: file.mimeType,
  });
  form.append('markers', JSON.stringify(markers));
  const response = await got.post<AnalyseImageResponse>('http://transformer/analyse', {
    body: form.getBuffer(),
    headers: form.getHeaders(),
    responseType: 'json',
  });
  return Object.values(response.body).map((value) => {
    const points = value.points.map(([x, y]) => ({ x, y }));
    return ({
      topLeft: points[0],
      topRight: points[1],
      bottomRight: points[2],
      bottomLeft: points[3],
      mmHeight: value.mm_height,
      mmWidth: value.mm_width,
      ratio: value.width / value.height,
    });
  });
}
