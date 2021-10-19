import { computed, onBeforeUnmount, shallowRef } from 'vue';

export const useStorage = <T>(key: string, getDefault: () => T) => {
  const parse = (value: string | null): T | null => {
    if (value === null) return null;
    return JSON.parse(value) as T;
  };
  const localValue = shallowRef<T | null>(parse(localStorage.getItem(key)));
  const listener = (event: StorageEvent) => {
    if (event.key !== key) return;
    localValue.value = parse(event.newValue);
  };
  window.addEventListener('storage', listener);
  onBeforeUnmount(() => {
    window.removeEventListener('storage', listener);
  });
  return computed<T>({
    get() {
      return localValue.value ?? getDefault();
    },
    set(value) {
      localValue.value = value;
      localStorage.setItem(key, JSON.stringify(value));
    },
  });
};
