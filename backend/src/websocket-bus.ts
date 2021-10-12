import { ObjectId, WithoutId } from 'mongodb';
import { DbSheet } from './database/types';
import {
  DefaultsMap, EventChannel,
} from './utils';

export type SheetListenerParams = [sheet: WithoutId<DbSheet>, causingRequestId: string];
export interface TestBus {
  sheetCreate: EventChannel<SheetListenerParams>;
  sheetChange: EventChannel<SheetListenerParams>;
}
const testMap = new DefaultsMap<string, TestBus>(() => ({
  sheetCreate: new EventChannel<SheetListenerParams>(),
  sheetChange: new EventChannel<SheetListenerParams>(),
}));

export const getWebsocketBus = () => ({
  getTest: (testId: ObjectId) => testMap.get(testId.toHexString()),
});
export type WebsocketBus = ReturnType<typeof getWebsocketBus>;
