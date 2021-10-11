import { WithoutId } from 'mongodb';
import { DbSheet } from './database/types';
import { EventBus } from './utils';

export const getWebsocketBus = () => ({
  sheetCreate: new EventBus<[sheet: WithoutId<DbSheet>, causingRequestId: string]>(),
  sheetChange: new EventBus<[sheet: WithoutId<DbSheet>, causingRequestId: string]>(),
});
export type WebsocketBus = ReturnType<typeof getWebsocketBus>;
