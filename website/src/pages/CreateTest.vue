<template>
  <full-height-page class="create-test">
    <q-splitter
      v-model="splitter"
      class="full-height"
      :limits="[20, 80]"
    >
      <template #before>
        <question-picker />
      </template>
      <template #after>
        <q-scroll-area class="full-height full-width scrollarea-full-width overflow-hidden">
          <div
            v-for="(page, pageIndex) in pageItems"
            :key="pageIndex"
            class="q-ma-lg relative-position"
          >
            <preview-render
              class="create-test__page"
            >
              <page-render
                :page-index="pageIndex"
                :total-pages="pageItems.length"
              />
            </preview-render>
            <div class="absolute-top-right q-ma-sm">
              <q-btn
                color="negative"
                icon="mdi-file-remove"
                round
                size="md"
                :disable="page.length !== 0 || pageItems.length === 1"
                @click="removePage(pageIndex)"
              >
                <q-tooltip>Remove page</q-tooltip>
              </q-btn>
              <q-tooltip v-if="pageItems.length === 1">
                Cannot remove all pages
              </q-tooltip>
              <q-tooltip v-else-if="page.length !== 0">
                Cannot remove page with content
              </q-tooltip>
            </div>
          </div>
          <div class="row justify-center q-mb-lg">
            <q-btn
              color="primary"
              icon="mdi-file-plus"
              label="Add page"
              @click="addPage"
            />
          </div>
        </q-scroll-area>
      </template>
    </q-splitter>
  </full-height-page>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import PreviewRender from 'components/render/PreviewRender.vue';
import QuestionPicker from '../components/createTest/QuestionPicker.vue';
import PageRender from '../components/render/PageRender.vue';
import { useStorage } from '../utils';
import FullHeightPage from '../components/FullHeightPage.vue';

interface Question {
  type: 'question',
  shortId: string;
  variants: string[];
}

type PageElement = Question;

export default defineComponent({
  components: {
    PreviewRender, PageRender, QuestionPicker, FullHeightPage,
  },
  setup() {
    const pages = ref<PageElement[][]>([[]]);

    return {
      splitter: useStorage<number>('create-test-splitter-position', () => 40),
      pageItems: computed(() => {
        let questionCounter = 0;
        return pages.value.map((page) => page.map((element) => {
          if (element.type === 'question') {
            const item = {
              type: 'question',
              number: questionCounter,
            };
            questionCounter += 1;
            return item;
          }
        }));
      }),
      addPage: () => {
        pages.value.push([]);
      },
      removePage: (pageIndex: number) => {
        pages.value.splice(pageIndex, 1);
      },
    };
  },
});
</script>

<style lang="scss">
.create-test {
  .create-test__page {
    outline: 1px solid black;
  }
}
</style>
