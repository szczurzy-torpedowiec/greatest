export function getTypeValidator<T>() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (x: T) => true;
}

export function sortedBy<T>(array: T[], key: keyof T, descending?: boolean): T[];
export function sortedBy<T, X>(array: T[], mapper: (item: T) => X, descending?: boolean): T[];
export function sortedBy<T, X>(
  array: T[],
  keyOrMapper: ((item: T) => X) | keyof T,
  descending = false,
): T[] {
  if (typeof keyOrMapper !== 'function') return sortedBy(array, (item) => item[keyOrMapper], descending);
  return [...array].sort((lhs, rhs) => {
    const lhsItem = keyOrMapper(lhs);
    const rhsItem = keyOrMapper(rhs);
    if (lhsItem === rhsItem) return 0;
    return ((lhsItem < rhsItem) !== descending) ? -1 : 1;
  });
}

export function omit<T, X extends keyof T>(obj: T, ...keys: X[]): Omit<T, X> {
  const newObject = { ...obj };
  keys.forEach((key) => {
    delete obj[key];
  });
  return newObject;
}

export function sortAndOmit<T, X extends keyof T>(
  array: T[],
  key: X,
  descending = false,
): Omit<T, X>[] {
  return sortedBy(array, key, descending)
    .map((item) => omit(item, key));
}

export function sortWithSecond<T, X>(
  array: [T, X][],
  descending = false,
): T[] {
  return sortedBy(array, 1, descending)
    .map((item) => item[0]);
}
