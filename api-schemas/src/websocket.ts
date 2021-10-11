import { Sheet } from './common';

export interface BaseWebhookMessage {
  type: string;
  causingRequestId: string;
}

export interface SheetCreateMessage extends BaseWebhookMessage {
  type: 'create';
  sheet: Sheet,
}

export interface SheetChangeMessage extends BaseWebhookMessage {
  type: 'change';
  sheet: Sheet,
}

export type TestWebsocketMessage = SheetCreateMessage | SheetChangeMessage;
