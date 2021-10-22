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

export function typed<X>(value: X): X {
  return value;
}

export function getVariantSymbol(variant: number) {
  return String.fromCharCode(variant + 65);
}

export * from './defaults-map';
export * from './freeze';
export * from './storage';
