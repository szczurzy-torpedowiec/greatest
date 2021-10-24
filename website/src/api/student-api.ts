import ky from 'ky';
import {
  CheckStudentReply, GetStudentSheetReply,
  StudentQuery,
} from 'greatest-api-schemas';

export function checkStudent(phrase: string) {
  const query: StudentQuery = { phrase };
  const searchParams = new URLSearchParams(query);
  return ky.get('/api/student/check', {
    searchParams,
  }).json<CheckStudentReply>();
}

export function getStudentSheet(phrase: string) {
  const query: StudentQuery = { phrase };
  const searchParams = new URLSearchParams(query);
  return ky.get('/api/student/sheet', {
    searchParams,
  }).json<GetStudentSheetReply>();
}

export function getStudentScanImageUrl(
  phrase: string,
  scanShortId: string,
) {
  return `/api/student/scans/${scanShortId}.webp?phrase=${encodeURIComponent(phrase)}`;
}
