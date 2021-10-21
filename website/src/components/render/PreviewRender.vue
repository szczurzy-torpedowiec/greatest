<template>
  <div class="preview-render">
    <div
      class="preview-render__wrapper"
      :style="style"
    >
      <slot />
    </div>
    <q-resize-observer
      :debounce="0"
      @resize="onResize"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const width = ref<number>();
    return {
      onResize: (size: { width: number, height: number }) => {
        width.value = size.width;
      },
      style: computed(() => {
        if (width.value === undefined) return {};
        return {
          '--render-mm': `${(width.value - 1) / 210}px`,
        };
      }),
    };
  },
});
</script>

<style lang="scss">
@import "src/css/render";

.preview-render {
  .preview-render__wrapper {
    width: render-mm($page-width-mm);
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
