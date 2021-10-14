import {
  TNull, TSchema, TUnion,
} from '@sinclair/typebox';

export function nullable<T extends TSchema>(schema: T): TUnion<[T, TNull]> {
  return { ...schema, nullable: true } as any;
}
