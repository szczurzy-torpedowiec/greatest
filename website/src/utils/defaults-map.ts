export class DefaultsMap<K, T> extends Map<K, T> {
  private readonly getDefault: (key: K) => T;

  constructor(getDefault: (key: K) => T, entries?: ([K, T])[]) {
    super(entries);
    this.getDefault = getDefault;
  }

  get(key: K): T {
    let value = super.get(key);
    if (value === undefined) {
      value = this.getDefault(key);
      this.set(key, value);
    }
    return value;
  }
}
