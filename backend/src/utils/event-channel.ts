export type Listener<T extends unknown[]> = (...args: T) => void;

export class EventChannel<T extends unknown[]> {
  private readonly listeners = new Set<Listener<T>>();

  public on(listener: Listener<T>) {
    if (this.listeners.has(listener)) console.warn('Listener already added');
    this.listeners.add(listener);
  }

  public off(listener: Listener<T>) {
    this.listeners.delete(listener);
  }

  public emit(...args: T) {
    this.listeners.forEach((listener) => listener(...args));
  }
}
