<template>
  <div class="page-render">
    <render-header
      phrase="eksperymentalnie przykład"
      :page-index="pageIndex"
      :total-pages="totalPages"
    />
    <div>
      <render-question
        v-for="question in elements"
        :key="`${question.questionSetShortId} ${question.questionShortId}`"
        :points="question.maxPoints"
        :variants="question.variants"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import RenderQuestion from 'components/render/RenderQuestion.vue';
import { PageElement } from 'components/render/types';
import RenderHeader from './RenderHeader.vue';

export default defineComponent({
  components: { RenderQuestion, RenderHeader },
  props: {
    pageIndex: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    elements: {
      type: Array as PropType<PageElement[]>,
      required: true,
    },
  },
});
</script>

<style lang="scss">
@import "src/css/render";

.page-render {
  height: render-mm($page-height-mm);
}
</style>
