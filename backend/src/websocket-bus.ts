import { ObjectId, WithoutId } from 'mongodb';
import { Scan } from 'greatest-api-schemas';
import { DbScan, DbSheet } from './database/types';
import {
  DefaultsMap, EventChannel,
} from './utils';

export type SheetListenerParams = [sheet: WithoutId<DbSheet>, causingRequestId: string];
function getTestBus() {
  return {
    sheetCreate: new EventChannel<SheetListenerParams>(),
    sheetChange: new EventChannel<SheetListenerParams>(),
    scanCreateBody: new EventChannel<[scanBody: Scan, causingRequestId: string]>(),
    scanChange: new EventChannel<[scan: WithoutId<DbScan>, causingRequestId: string]>(),
  };
}
export type TestBus = ReturnType<typeof getTestBus>;
const testMap = new DefaultsMap<string, TestBus>(getTestBus);

export const getWebsocketBus = () => ({
  getTest: (testId: ObjectId) => testMap.get(testId.toHexString()),
});
export type WebsocketBus = ReturnType<typeof getWebsocketBus>;
