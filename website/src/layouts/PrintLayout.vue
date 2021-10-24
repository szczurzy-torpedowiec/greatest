<template>
  <div class="print-layout">
    <div
      v-if="showError"
      class="print-layout__error"
    >
      {{ $t('print.error') }}
    </div>
    <template
      v-for="(page, i) in pages"
      v-else
      :key="i"
    >
      <div
        v-if="page === null"
        class="print-layout__empty-page"
      />
      <page-render
        v-else
        class="print-layout__page"
        :page-index="page.pageIndex"
        :total-pages="page.totalPages"
        :phrase="page.phrase"
        :qr-code-id="page.qrCodeId"
      >
        <render-question
          v-for="(element, elementIndex) in page.elements"
          :key="elementIndex"
          :points="element.maxPoints"
          :variants="element.variants"
          :variant="element.variant"
          :question-index="element.questionIndex"
        />
      </page-render>
    </template>
    <div
      v-if="loading"
      class="print-layout__loading"
    >
      <q-circular-progress
        size="96px"
        indeterminate
        color="primary"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, onMounted, ref, nextTick,
} from 'vue';
import { useRoute } from 'vue-router';
import { getPrintData } from 'src/api';
import { PrintDataElement } from 'greatest-api-schemas';
import RenderQuestion from 'components/render/RenderQuestion.vue';
import PageRender from '../components/render/PageRender.vue';

interface Page {
  pageIndex: number;
  totalPages: number;
  phrase: string;
  qrCodeId: string;
  elements: PrintDataElement[];
}

export default defineComponent({
  components: { PageRender, RenderQuestion },
  setup() {
    const route = useRoute();
    const token = route.query.token as string;
    const pages = ref<(Page | null)[]>([]);
    const showError = ref(false);
    const loading = ref(true);
    const load = async () => {
      try {
        const printData = await getPrintData(token);
        const sheetPages: Page[][] = printData.sheets
          .map((sheet) => sheet.pages.map((elements, pageIndex) => ({
            pageIndex,
            totalPages: sheet.pages.length,
            phrase: sheet.phrase,
            qrCodeId: sheet.qrCodeId,
            elements,
          })));
        pages.value = sheetPages.flatMap(
          (sheet) => ((printData.doubleSided && sheet.length % 2 === 1) ? [...sheet, null] : sheet),
        );
        await nextTick();
        setTimeout(() => {
          loading.value = false;
          window.print();
        }, 1000);
      } catch (error) {
        console.error(error);
        showError.value = true;
      }
    };
    onMounted(load);
    return {
      pages,
      showError,
      loading,
    };
  },
});
</script>

<style lang="scss">
* {
  -webkit-print-color-adjust: exact !important;
}

@page {
  size: 210mm 297mm;
  margin: 0 !important;
}

.print-layout {
  --render-mm: 1mm;
  font-family: sans-serif;

  .print-layout__error {
    background-color: $negative;
    color: white;
    font-size: 2em;
    text-align: center;
    padding: 8px 16px;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    margin-top: 16px;
    border-radius: 4px;
  }

  .print-layout__page {
    page-break-inside: avoid;
  }

  .print-layout__empty-page {
    height: 296mm;
  }

  .print-layout__loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: #0006;
    display: flex;
    align-items: center;
    justify-content: center;

    @media print {
      display: none;
    }
  }
}
</style>
