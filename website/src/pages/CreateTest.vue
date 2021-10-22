<template>
  <full-height-page class="create-test">
    <q-splitter
      v-model="splitter"
      class="full-height"
      :limits="[20, 80]"
    >
      <template #before>
        <question-picker
          :used-questions="usedQuestions"
          :questions-map="questionsMap"
          @add-question="onAddQuestion"
        />
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
                :elements="page"
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
import {
  computed, defineComponent, reactive, ref,
} from 'vue';
import PreviewRender from 'components/render/PreviewRender.vue';
import {
  PageElement,
  PageIdElement,
  QuestionElementOpen,
  QuestionElementQuiz,
} from 'components/render/types';
import { QuestionWithIds } from 'greatest-api-schemas';
import QuestionPicker from '../components/createTest/QuestionPicker.vue';
import PageRender from '../components/render/PageRender.vue';
import { DefaultsMap, typed, useStorage } from '../utils';
import FullHeightPage from '../components/FullHeightPage.vue';

export default defineComponent({
  components: {
    PreviewRender, PageRender, QuestionPicker, FullHeightPage,
  },
  setup() {
    const pages = ref<PageIdElement[][]>([[]]);

    const usedQuestions = computed(() => {
      const map = new DefaultsMap<string, Set<string>>(() => new Set());
      pages.value.forEach((page) => page.forEach((item) => {
        if (item.type === 'question') map.get(item.questionSetShortId).add(item.questionShortId);
      }));
      return map;
    });
    const questionsMap = reactive(new Map<string, QuestionWithIds[] | null>());
    return {
      questionsMap,
      splitter: useStorage<number>('create-test-splitter-position', () => 40),
      pages,
      usedQuestions,
      pageItems: computed<PageElement[][]>(() => {
        let questionCounter = 0;
        return pages.value.map((page) => page.map((element) => {
          switch (element.type) {
            case 'question': {
              const itemBase = {
                type: 'question',
                number: questionCounter,
              } as const;
              questionCounter += 1;
              // TODO: Fix O(n^2) complexity
              const question = questionsMap
                .get(element.questionSetShortId)
                ?.find((question1) => question1.shortId === element.questionShortId);
              if (question === undefined) throw new Error('Question set not found');
              switch (question.type) {
                case 'open': return typed<QuestionElementOpen>({
                  ...itemBase,
                  maxPoints: question.maxPoints,
                  questionType: 'open',
                  variants: question.variants.map((variant) => ({
                    type: 'open',
                    content: variant.content,
                  })),
                });
                case 'quiz': return typed<QuestionElementQuiz>({
                  ...itemBase,
                  maxPoints: question.maxPoints,
                  questionType: 'quiz',
                  variants: question.variants.map((variant) => ({
                    type: 'quiz',
                    content: variant.content,
                    correctAnswer: variant.correctAnswer,
                    incorrectAnswers: [...variant.incorrectAnswers],
                  })),
                });
              }
            }
          }
        }));
      }),
      addPage: () => {
        pages.value.push([]);
      },
      removePage: (pageIndex: number) => {
        pages.value.splice(pageIndex, 1);
      },
      onAddQuestion: (questionSetShortId: string, questionShortId: string, variants: string[]) => {
        pages.value[pages.value.length - 1].push({
          type: 'question',
          questionSetShortId,
          questionShortId,
          variants,
        });
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
