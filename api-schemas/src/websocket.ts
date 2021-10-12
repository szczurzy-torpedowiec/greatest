import { Scan, Sheet } from './common';

export interface BaseWebhookMessage {
  type: string;
  causingRequestId: string;
}

export interface SheetCreateMessage extends BaseWebhookMessage {
  type: 'sheet-create';
  sheet: Sheet,
}

export interface SheetChangeMessage extends BaseWebhookMessage {
  type: 'sheet-change';
  sheet: Sheet,
}

export interface ScanCreateMessage extends BaseWebhookMessage {
  type: 'scan-create';
  scan: Scan,
}

export interface ScanChangeMessage extends BaseWebhookMessage {
  type: 'scan-change';
  scan: Scan,
}

export type TestWebsocketMessage =
  SheetCreateMessage
  | SheetChangeMessage
  | ScanCreateMessage
  | ScanChangeMessage;
