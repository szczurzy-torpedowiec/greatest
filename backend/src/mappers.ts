import { WithoutId } from 'mongodb';
import { Sheet } from 'greatest-api-schemas';
import { DbSheet, DbTest, DbUser } from './database/types';

export function mapSheet(sheet: WithoutId<DbSheet>): Sheet {
  return {
    shortId: sheet.shortId,
    questions: sheet.questions,
    student: sheet.student,
  };
}

export function mapScanOtherTest(test: WithoutId<DbTest>, user: DbUser) {
  return {
    shortId: test.shortId,
    name: test.ownerId.equals(user._id) ? test.name : null,
  };
}
