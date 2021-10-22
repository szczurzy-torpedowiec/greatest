<template>
  <div class="preview-render">
    <div
      class="preview-render__wrapper"
      :style="style"
    >
      <slot :render-mm-pixels="renderMmPixels" />
    </div>
    <q-resize-observer
      :debounce="0"
      @resize="onResize"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

interface Size {
  width: number;
  height: number;
}

export default defineComponent({
  props: {
    reduced: Boolean,
  },
  setup(props) {
    const size = ref<Size>({ width: 100, height: 100 });
    const widthMm = computed(() => (props.reduced ? 120 : 210));
    const renderMmPixels = computed(() => (size.value.width - 1) / widthMm.value);
    return {
      onResize: (value: Size) => {
        size.value = value;
      },
      style: computed(() => ({
        '--width-mm': `${widthMm.value}`,
        '--render-mm': `${renderMmPixels.value}px`,
      })),
      size,
      renderMmPixels,
    };
  },
});
</script>

<style lang="scss">
@import "src/css/render";

.preview-render {
  .preview-render__wrapper {
    width: render-mm(var(--width-mm));
    font-size: $render-font-size;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.5;
    font-family: sans-serif;
  }

  .test-box {
    width: var(--render-mm);
    height: 10px;
    background: red;
  }
}
</style>
