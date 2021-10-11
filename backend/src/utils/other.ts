export function promiseCache<K, T>(handler: (key: K) => Promise<T>) {
  const map = new Map<K, Promise<T>>();
  return (key: K) => {
    let promise = map.get(key);
    if (promise === undefined) {
      promise = handler(key);
      map.set(key, promise);
    }
    return promise;
  };
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined) throw new Error(`Env variable "${name}" not set`);
  return value;
}

export function mapTimes<T>(fn: (index: number) => T, count: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i += 1) result.push(fn(i));
  return result;
}

export function randomInt(to: number): number;
export function randomInt(from: number, to: number): number;
export function randomInt(from: number, to?: number): number {
  if (to === undefined) return randomInt(0, from);
  return Math.floor(Math.random() * (to - from)) + from;
}

export const bindEquals = <T>(val: T) => (other: T) => val === other;

export const bindNot = <T extends unknown[]>(
  fn: (...args: T) => boolean,
) => (...args: T) => !fn(...args);
