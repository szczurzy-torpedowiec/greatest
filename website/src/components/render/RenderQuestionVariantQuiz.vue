<template>
  <div
    class="render-question-variant-quiz"
    :class="{
      'render-question-variant-quiz--hidden': hidden
    }"
  >
    <div class="render-question-variant-quiz__content">
      {{ variant.content }}
    </div>
    <div class="render-question-variant-quiz__answers">
      <div
        v-for="(answer, index) in answers"
        :key="index"
        class="render-question-variant-quiz__answer"
      >
        <div class="render-question-variant-quiz__answer-box" />
        <b
          class="render-question-variant-quiz__answer-symbol"
          :class="{
            'render-question-variant-quiz__answer-symbol--demo': demo
          }"
        >
          {{ answer.symbol }}
        </b>
        <div class="render-question-variant-quiz__answer-content">
          {{ answer.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { RenderVariantQuiz } from 'components/render/types';
import { getAnswerSymbol } from 'src/utils';

export default defineComponent({
  props: {
    hidden: Boolean,
    variant: {
      type: Object as PropType<RenderVariantQuiz>,
      required: true,
    },
    demo: Boolean,
  },
  setup(props) {
    return {
      answers: computed(() => props.variant.answers.map((content, index) => ({
        content,
        symbol: getAnswerSymbol(index),
      }))),
    };
  },
});
</script>

<style lang="scss">
@import "src/css/render";

.render-question-variant-quiz {
  text-align: justify;

  .render-question-variant-quiz__content {
    margin-bottom: render-mm(2);
  }

  .render-question-variant-quiz__answer {
    display: flex;
    align-items: baseline;
    margin-bottom: render-mm(1);

    .render-question-variant-quiz__answer-box {
      align-self: start;
      width: render-mm(6);
      height: render-mm(6);
      border: render-mm(0.2) solid black;
      border-radius: render-mm(1);
      margin-right: render-mm(3);
    }

    .render-question-variant-quiz__answer-symbol {
      min-width: render-mm(7);
      padding-right: render-mm(2);

      &.render-question-variant-quiz__answer-symbol--demo {
        filter: blur(render-mm(0.5));
      }
    }
  }

  &.render-question-variant-quiz--hidden {
    visibility: hidden;
  }
}
</style>
