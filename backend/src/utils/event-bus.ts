import { bindEquals, bindNot } from './other';

export type Listener<T extends unknown[]> = (...args: T) => void;

export class EventBus<T extends unknown[]> {
  private listeners: Listener<T>[] = [];

  public on(listener: Listener<T>) {
    this.listeners.push(listener);
  }

  public off(listener: Listener<T>) {
    this.listeners = this.listeners.filter(bindNot(bindEquals(listener)));
  }

  public emit(...args: T) {
    this.listeners.forEach((listener) => listener(...args));
  }
}
