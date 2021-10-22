import { DeepReadonly, Ref } from '@vue/reactivity';
import {
  readonly, ref, watch, unref,
} from 'vue';

export const useFreeze = <T>(
  target: Ref<T>,
  frozen: DeepReadonly<Ref<boolean>>,
) => {
  const storedValue = ref<T>(target.value);
  watch(target, (value) => {
    if (frozen.value) return;
    storedValue.value = unref(ref(value)); // Making TS happy, probably could be done better
  });
  let unfreezeTimeoutId: null | number = null;
  watch(frozen, (value) => {
    if (unfreezeTimeoutId !== null) window.clearTimeout(unfreezeTimeoutId);
    if (value) unfreezeTimeoutId = null;
    else {
      unfreezeTimeoutId = window.setTimeout(() => {
        storedValue.value = unref(ref(target.value));
        unfreezeTimeoutId = null;
      }, 50);
    }
  });
  return readonly(storedValue);
};
