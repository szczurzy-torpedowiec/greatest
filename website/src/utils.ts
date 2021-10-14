export function getTypeValidator<T>() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (x: T) => true;
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
