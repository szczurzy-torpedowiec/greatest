export function getTypeValidator<T extends unknown[]>() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (...args: T) => true;
}

export function firstNotUndefined<T, V>(
  array: T[],
  mapper: (item: T) => V | undefined,
): V | undefined {
  let matched: V | undefined;
  array.some((item) => {
    matched = mapper(item);
    return matched !== undefined;
  });
  return matched;
}

export function isEmpty(value: string) {
  return value.trim() === '';
}

export function isNotEmpty(value: string) {
  return !isEmpty(value);
}

export const typed = <X>(value: X): X => value;

export * from './defaults-map';
export * from './storage';
