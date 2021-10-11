import { WithoutId } from 'mongodb';
import { DbSheet } from './database/types';
import { EventBus } from './utils';

export const getWebsocketBus = () => ({
  sheetCreate: new EventBus<[sheet: WithoutId<DbSheet>]>(),
  sheetChange: new EventBus<[sheet: WithoutId<DbSheet>]>(),
});
export type WebsocketBus = ReturnType<typeof getWebsocketBus>;
