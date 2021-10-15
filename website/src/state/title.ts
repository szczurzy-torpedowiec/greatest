import { onBeforeUnmount, ref, watch } from 'vue';
import { DeepReadonly, Ref } from '@vue/reactivity';

export const TitleLoading = Symbol('Title loading');
export const titleState = ref<null | string| typeof TitleLoading>(null);

export const useTitleState = (state: DeepReadonly<Ref<string | null | typeof TitleLoading>>) => {
  watch(state, () => {
    titleState.value = state.value;
  }, {
    immediate: true,
  });
  onBeforeUnmount(() => {
    titleState.value = null;
  });
};
