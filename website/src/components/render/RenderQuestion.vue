<template>
  <div class="render-question">
    <div class="render-question__label">
      <div class="render-question__label-question">
        Pytanie <b>{{ questionIndex ?? '-' }}</b>
      </div>
      <div class="render-question__label-variant">
        Wariant
        <b v-if="variant !== null">
          {{ getVariantSymbol(variant) }}
        </b>
        <span
          v-for="index in variants.length"
          v-else
          :key="index"
          class="render-question__label-variant-item"
          :class="{
            'render-question__label-variant-item--active': selectedVariant === index-1
          }"
          tabindex="0"
          @click="selectedVariant = index-1"
        >
          {{ getVariantSymbol(index-1) }}
        </span>
      </div>
      <div class="render-question__label-spacer" />
      <div class="render-question__label-points">
        <b>{{ points }}</b> punktów
      </div>
    </div>
    <div class="render-question__variants">
      <render-question-variant-open
        v-for="(item, index) in variants"
        :key="index"
        class="render-question__variant"
        :hidden="selectedVariant !== index"
        :variant="item"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, PropType, ref, watch,
} from 'vue';
import RenderQuestionVariantOpen from 'components/render/RenderQuestionVariantOpen.vue';
import { RenderVariant } from 'components/render/types';

export default defineComponent({
  components: { RenderQuestionVariantOpen },
  props: {
    questionIndex: {
      type: Number as PropType<number | null>,
      default: null,
    },
    variant: {
      type: Number as PropType<number | null>,
      default: null,
    },
    variants: {
      type: Array as PropType<RenderVariant[]>,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const selectedVariant = ref(0);
    watch(() => props.variant, (value) => {
      if (value !== null) selectedVariant.value = value;
    }, { immediate: true });
    return {
      selectedVariant,
      getVariantSymbol: (variant: number) => String.fromCharCode(variant + 65),
    };
  },
});
</script>

<style lang="scss">
@import "src/css/render";

.render-question {
  padding: 0 render-mm(5);

  .render-question__label {
    display: flex;
    align-items: baseline;

    .render-question__label-question {
      border: render-mm(0.2) solid black;
      border-radius: render-mm(1);
      padding: 0 render-mm(1.5);
      height: render-mm(8);
      line-height: render-mm(8);
    }

    .render-question__label-variant {
      margin-left: render-mm(1.5);

      .render-question__label-variant-item {
        margin-right: render-mm(1.5);
        padding: render-mm(0.5) render-mm(1);
        border: render-mm(0.2) solid blue;
        border-radius: render-mm(1);
        user-select: none;

        &.render-question__label-variant-item--active {
          background-color: rgba(blue, 50%);
          color: white;
        }

        &:not(.render-question__label-variant-item--active) {
          color: blue;
          cursor: pointer;
        }
      }
    }

    .render-question__label-spacer {
      flex-grow: 1;
      min-width: render-mm(2);
    }

    .render-question__label-points {

    }
  }

  .render-question__variants {
    display: grid;
    margin-top: render-mm(2);

    .render-question__variant {
      grid-row: 1;
      grid-column: 1;
    }
  }
}
</style>
