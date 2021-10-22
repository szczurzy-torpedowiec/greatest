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
        phrase="eksperymentalnie przykład"
        :page-index="pageIndex"
        :total-pages="totalPages"
      />
      <div class="page-render__body">
        <slot />
      </div>
      <slot name="wrapper" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
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

  &.page-render--show-excess:not(.page-render--dragging) {
    height: fit-content;
    min-height: render-mm($page-height-mm);
  }

  .page-render__wrapper {
    display: flex;
    flex-direction: column;

    .page-render__body {
      flex-grow: 1;
    }
  }

  &.page-render--dragging .page-render__wrapper {
    height: 100%;
  }
}
</style>
