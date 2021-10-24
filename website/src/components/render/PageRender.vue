<template>
  <div
    class="page-render"
    :class="{
      'page-render--show-excess': showExcess,
      'page-render--dragging': dragging,
    }"
  >
    <div class="page-render__wrapper">
      <render-header
        :phrase="phrase"
        :page-index="pageIndex"
        :total-pages="totalPages"
        :qr-code-id="qrCodeId"
      >
        <slot name="header" />
      </render-header>
      <div class="page-render__body">
        <slot />
      </div>
      <slot name="wrapper" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import RenderHeader from './RenderHeader.vue';

export default defineComponent({
  components: { RenderHeader },
  props: {
    pageIndex: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    phrase: {
      type: String,
      required: true,
    },
    qrCodeId: {
      type: String as PropType<string | null>,
      default: null,
    },
    showExcess: Boolean,
    dragging: Boolean,
  },
});
</script>

<style lang="scss">
@import "src/css/render";

.page-render {
  height: render-mm($page-height-mm);
  overflow: hidden;

  &.page-render--show-excess {
    height: fit-content;
    min-height: render-mm($page-height-mm);
  }

  &.page-render--dragging {
    display: flex;
    flex-direction: column;

    .page-render__wrapper {
      flex-grow: 1;

      .page-render__body {
        display: flex;
        flex-direction: column;
      }
    }
  }

  .page-render__wrapper {
    display: flex;
    flex-direction: column;

    .page-render__body {
      flex-grow: 1;
    }
  }
}
</style>
