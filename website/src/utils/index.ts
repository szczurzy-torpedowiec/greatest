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

export function getAnswerSymbol(answer: number) {
  return `${String.fromCharCode(answer + 97)})`;
}

export function parsePxString(value: string): number | null {
  const regexResult = /^(-?\d*(\d|(\.\d+)))px$/.exec(value);
  if (regexResult === null) return null;
  return parseFloat(regexResult[1]);
}

export function percent(value: number, max: number) {
  if (max === 0) return null;
  return Math.ceil((value / max) * 100);
}

export * from './defaults-map';
export * from './freeze';
export * from './storage';
