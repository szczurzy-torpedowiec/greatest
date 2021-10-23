<template>
  <div class="render-question-content">
    <template
      v-for="(item, index) in variants"
      :key="index"
    >
      <render-question-variant-open
        v-if="item.type === 'open'"
        class="render-question-content__variant"
        :hidden="variant !== index"
        :variant="item"
      />
      <render-question-variant-quiz
        v-else-if="item.type === 'quiz'"
        class="render-question-content__variant"
        :hidden="variant !== index"
        :variant="item"
        :demo="demo"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { RenderVariant } from 'components/render/types';
import RenderQuestionVariantOpen from 'components/render/RenderQuestionVariantOpen.vue';
import RenderQuestionVariantQuiz from 'components/render/RenderQuestionVariantQuiz.vue';

export default defineComponent({
  components: { RenderQuestionVariantQuiz, RenderQuestionVariantOpen },
  props: {
    variant: {
      type: Number as PropType<number>,
      required: true,
    },
    variants: {
      type: Array as PropType<RenderVariant[]>,
      required: true,
    },
    demo: {
      type: Boolean,
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
