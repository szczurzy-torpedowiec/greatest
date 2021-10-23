<template>
  <div
    class="render-question-variant-open"
    :class="{
      'render-question-variant-open--hidden': hidden
    }"
  >
    {{ variant.content }}
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { RenderVariantOpen } from 'components/render/types';

export default defineComponent({
  props: {
    hidden: Boolean,
    variant: {
      type: Object as PropType<RenderVariantOpen>,
      required: true,
    },
  },
});
</script>

<style lang="scss">
.render-question-variant-open {
  text-align: justify;

  &.render-question-variant-open--hidden {
    visibility: hidden;
  }
}
</style>
