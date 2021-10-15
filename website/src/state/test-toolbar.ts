import { onBeforeUnmount, ref, watch } from 'vue';
import { DeepReadonly, Ref } from '@vue/reactivity';

export interface TestToolbarState {
  unassignedScanCount: number | null;
}
export const testToolbarState = ref<null | TestToolbarState>(null);

export const useToolbarState = (state: DeepReadonly<Ref<TestToolbarState>>) => {
  watch(state, () => {
    testToolbarState.value = state.value;
  }, {
    immediate: true,
  });
  onBeforeUnmount(() => {
    testToolbarState.value = null;
  });
};
