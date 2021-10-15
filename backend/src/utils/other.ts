export function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined) throw new Error(`Env variable "${name}" not set`);
  return value;
}

export function requireBooleanEnv(name: string): boolean {
  const value = requireEnv(name).toLowerCase();
  if (['true', '1'].includes(value)) return true;
  if (['false', '0'].includes(value)) return false;
  throw new Error(`Env variable ${name} is not a boolean (current value: ${value})`);
}

export function mapTimes<T>(fn: (index: number) => T, count: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i += 1) result.push(fn(i));
  return result;
}

export function filterNotNull<T>(
  array: readonly (T)[],
): Exclude<T, null>[] {
  return array.filter((x) => x !== null) as Exclude<T, null>[];
}

export function randomInt(to: number): number;
export function randomInt(from: number, to: number): number;
export function randomInt(from: number, to?: number): number {
  if (to === undefined) return randomInt(0, from);
  return Math.floor(Math.random() * (to - from)) + from;
}

export function randomElement<T>(array: T[]): T {
  return array[randomInt(array.length)];
}

export const bindEquals = <T>(val: T) => (other: T) => val === other;

export const bindNot = <T extends unknown[]>(
  fn: (...args: T) => boolean,
) => (...args: T) => !fn(...args);

export function getOnly<T>(array: T[]): T | undefined {
  if (array.length === 1) return array[0];
  return undefined;
}
