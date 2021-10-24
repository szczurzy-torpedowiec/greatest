import ky from 'ky';
import { PrintDataQuery, PrintDataReply } from 'greatest-api-schemas';

export function getPrintData(token: string) {
  const query: PrintDataQuery = { token };
  const searchParams = new URLSearchParams(query);
  return ky.get('/api/print-data', {
    searchParams,
  }).json<PrintDataReply>();
}
