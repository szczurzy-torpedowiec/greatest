import { TSchema, Type } from '@sinclair/typebox';

export function nullable<T extends TSchema>(type: T) {
  return Type.Union([type, Type.Null()]);
}
