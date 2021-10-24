<template>
  <div class="print-layout">
    <page-render class="print-layout__page" />
    <page-render class="print-layout__page" />
    <div class="print-layout__empty-page" />
    <div class="print-layout__empty-page" />
    <div class="print-layout__empty-page" />
    <div class="print-layout__empty-page" />
    <page-render class="print-layout__page" />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import PageRender from '../components/render/PageRender.vue';

export default defineComponent({
  components: { PageRender },
  setup() {
    const route = useRoute();
    const { token } = route.query;
    return { token };
  },
});
</script>

<style lang="scss">
.print-layout {
  --render-mm: 1mm;

  .print-layout__page {
    page-break-inside: avoid;
  }

  .print-layout__empty-page {
    height: 296mm;
  }

  @page {
    size: 210mm 297mm;
    margin: 0;
  }
}
</style>
