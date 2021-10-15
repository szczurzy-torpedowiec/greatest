import { WithoutId } from 'mongodb';
import { Scan, Sheet } from 'greatest-api-schemas';
import {
  DbScan, DbSheet, DbTest, DbUser,
} from './database/types';
import { filterNotNull } from './utils';
import { DbManager } from './database/database';

export function mapSheet(sheet: WithoutId<DbSheet>): Sheet {
  return {
    shortId: sheet.shortId,
    phrase: sheet.phrase,
    generated: sheet.generated,
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

export async function mapScan(
  scan: WithoutId<DbScan>,
  user: DbUser,
  dbManager: DbManager,
): Promise<Scan> {
  let sheet: null | {
    shortId: string,
    page: number | null
  };
  if (scan.sheet === null) sheet = null;
  else {
    const dbSheet = await dbManager.sheetsCollection.findOne({
      _id: scan.sheet.id,
    });
    if (dbSheet === null) sheet = null;
    else {
      sheet = {
        shortId: dbSheet.shortId,
        page: scan.sheet.page,
      };
    }
  }
  return {
    shortId: scan.shortId,
    uploadedOn: scan.uploadedOn.toISOString(),
    sheet,
    detections: filterNotNull(await Promise.all(scan.detections.map(async (detection) => {
      const dbSheet = await dbManager.sheetsCollection.findOne({
        _id: detection.sheetId,
      });
      if (dbSheet === null) return null;
      return {
        sheetShortId: dbSheet.shortId,
        page: detection.page,
      };
    }))),
    otherTests: filterNotNull(await Promise.all(scan.otherTests.map(async (otherTestId) => {
      const test = await dbManager.testsCollection.findOne({
        _id: otherTestId,
      });
      if (test === null) return null;
      return mapScanOtherTest(test, user);
    }))),
  };
}
