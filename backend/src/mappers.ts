import { WithoutId } from 'mongodb';
import { Sheet } from 'greatest-api-schemas';
import { DbSheet } from './database/types';

export function mapSheet(sheet: WithoutId<DbSheet>): Sheet {
  return {
    shortId: sheet.shortId,
    questions: sheet.questions,
    student: sheet.student,
  };
}
