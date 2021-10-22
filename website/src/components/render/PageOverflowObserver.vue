<template>
  <q-resize-observer
    :debounce="0"
    @resize="onResize"
  />
</template>

<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import { getTypeValidator, useFreeze } from 'src/utils';

interface Size {
  width: number;
  height: number;
}

export default defineComponent({
  props: {
    renderMmPixels: {
      type: Number,
      required: true,
    },
    freeze: Boolean,
  },
  emits: {
    'update:overflow': getTypeValidator<[overflow: boolean]>(),
  },
  setup(props, { emit }) {
    const height = ref(100);
    const heightLimitMm = 297 - 10;
    const overflow = computed(() => height.value > heightLimitMm * props.renderMmPixels);
    const frozenOverflow = useFreeze(overflow, computed(() => props.freeze));
    watch(frozenOverflow, (value) => {
      emit('update:overflow', value);
    }, { immediate: true });
    return {
      onResize: (value: Size) => {
        height.value = value.height;
      },
    };
  },
});
</script>
