import { Sheet } from './common';

export interface SheetCreateMessage {
  type: 'create';
  sheet: Sheet,
}

export interface SheetChangeMessage {
  type: 'change';
  sheet: Sheet,
}

export type TestWebsocketMessage = SheetCreateMessage | SheetChangeMessage;
