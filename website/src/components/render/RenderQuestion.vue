<template>
  <div class="render-question">
    <div class="render-question__label-wrapper">
      <div class="render-question__label">
        <div class="render-question__label-question">
          <span class="render-question__label-question-text">
            {{ questionNumberString }}
          </span>
        </div>
        <div
          v-if="variants.length !== 1"
          class="render-question__label-variant"
          :class="{
            'render-question__label-variant--clickable': variantClickable
          }"
          :role="variantClickable ? 'button' : undefined"
        >
          {{ variantSymbol }}
          <slot name="variant-menu" />
        </div>
      </div>
      <div class="render-question__label-spacer" />
    </div>
    <render-question-content
      :variant="variant"
      :variants="variants"
      class="render-question__content"
      :demo="demo"
    />
    <div class="render-question__points">
      <b>{{ points }}</b> punktów
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent, PropType,
} from 'vue';
import { RenderVariant } from 'components/render/types';
import RenderQuestionContent from 'components/render/RenderQuestionContent.vue';
import { getVariantSymbol } from 'src/utils';

export default defineComponent({
  components: { RenderQuestionContent },
  props: {
    questionIndex: {
      type: Number as PropType<number | null>,
      default: null,
    },
    variant: {
      type: Number as PropType<number>,
      required: true,
    },
    variants: {
      type: Array as PropType<RenderVariant[]>,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    variantClickable: Boolean,
    demo: Boolean,
  },
  setup(props) {
    return {
      variantSymbol: computed(() => getVariantSymbol(props.variant)),
      questionNumberString: computed(() => {
        if (props.questionIndex === null) return '-';
        return props.questionIndex + 1;
      }),
    };
  },
});
</script>

<style lang="scss">
@import "src/css/render";

.render-question {
  padding: 0 render-mm(5);
  display: flex;
  align-items: baseline;
  margin-bottom: render-mm(5);

  .render-question__label-wrapper {
    min-width: render-mm(18);

    .render-question__label {
      border: render-mm(0.2) solid black;
      border-radius: render-mm(1);
      display: flex;
      height: render-mm(7);
      line-height: render-mm(7);
      overflow: hidden;

      .render-question__label-question {
        background-color: black;
        color: white;
        min-width: render-mm(7);
        text-align: center;
        padding: 0 render-mm(1.5);
        flex-grow: 1;
        font-weight: 600;
      }

      .render-question__label-variant {
        min-width: render-mm(7);
        padding: 0 render-mm(1.5);
        text-align: center;

        &.render-question__label-variant--clickable {
          cursor: pointer;
          user-select: none;
          transition: background-color 150ms;

          &:hover {
            background: #0002;
          }
        }
      }
    }
  }

  .render-question__content {
    margin-left: render-mm(3);
    margin-right: render-mm(3);
  }

  .render-question__points {
    flex-grow: 1;
    text-align: right;
  }
}
</style>
