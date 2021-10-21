<template>
  <div class="page-render">
    <render-header
      phrase="eksperymentalnie przykład"
      :page-index="pageIndex"
      :total-pages="totalPages"
    />
    <div>
      <render-question
        :points="20"
        :variants="[]"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RenderQuestion from 'components/render/RenderQuestion.vue';
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
  },
});
</script>

<style lang="scss">
@import "src/css/render";

.page-render {
  height: render-mm($page-height-mm);
}
</style>
