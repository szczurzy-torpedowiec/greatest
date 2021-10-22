<template>
  <div class="render-question-content">
    <render-question-variant-open
      v-for="(item, index) in variants"
      :key="index"
      class="render-question-content__variant"
      :hidden="variant !== index"
      :variant="item"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { RenderVariant } from 'components/render/types';
import RenderQuestionVariantOpen from 'components/render/RenderQuestionVariantOpen.vue';

export default defineComponent({
  components: { RenderQuestionVariantOpen },
  props: {
    variant: {
      type: Number as PropType<number>,
      required: true,
    },
    variants: {
      type: Array as PropType<RenderVariant[]>,
      required: true,
    },
  },
});
</script>

<style lang="scss">
@import "src/css/render";

.render-question-content {
  display: grid;
  width: render-mm($question-width-mm);

  .render-question-content__variant {
    grid-row: 1;
    grid-column: 1;
  }
}
</style>
