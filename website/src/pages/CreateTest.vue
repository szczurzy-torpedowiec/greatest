<template>
  <full-height-page class="create-test row">
    <question-picker
      class="create-test__question-picker"
      :used-questions="usedQuestions"
      :questions-map="questionsMap"
      @add-question="onAddQuestion"
    />
    <q-separator vertical />
    <div class="flex-grow full-height">
      <q-scroll-area class="full-height full-width scrollarea-full-width overflow-hidden">
        <div class="create-test__pages q-px-lg">
          <div
            v-for="(page, pageIndex) in pageItems"
            :key="pageIndex"
            class="create-test__page q-mx-auto q-my-lg relative-position shadow-4"
            :class="{
              'create-test__page--overflow': page.overflow
            }"
          >
            <preview-render>
              <template #default="{ renderMmPixels }">
                <page-render
                  :page-index="pageIndex"
                  :total-pages="pageItems.length"
                  show-excess
                  :dragging="draggingCount > 0"
                >
                  <draggable
                    group="page"
                    :model-value="page.elements"
                    item-key="key"
                    :component-data="{
                      class: (draggingCount > 0) ? 'flex-grow' : 'fill-height',
                    }"
                    @change="page.onQuestionOrderChange"
                    @start="draggingCount += 1"
                    @end="draggingCount -= 1"
                  >
                    <template #item="{element, index}">
                      <render-question
                        :points="element.maxPoints"
                        :variants="element.variants"
                        :variant="element.idElement.variant"
                        :question-index="element.number"
                        variant-clickable
                        class="create-test__render-question"
                        :class="{
                          'create-test__render-question--dragging': draggingCount > 0
                        }"
                      >
                        <template #variant-menu>
                          <q-tooltip>
                            Pick previewed variant
                          </q-tooltip>
                          <q-menu
                            cover
                            auto-close
                          >
                            <question-variant-picker
                              :variant-count="element.variants.length"
                              :model-value="element.idElement.variant"
                              @update:model-value="page.onVariantPicked(index, $event)"
                            />
                          </q-menu>
                        </template>
                      </render-question>
                    </template>
                  </draggable>
                  <template #header>
                    <div
                      v-if="draggingCount > 0"
                      class="create-test__trash"
                    >
                      <div class="create-test__trash-body">
                        <q-icon
                          name="mdi-delete"
                          color="negative"
                        />
                      </div>
                      <draggable
                        group="page"
                        :items="[]"
                        item-key="key"
                        :component-data="{
                          class: 'full-height full-width',
                        }"
                        ghost-class="create-test__trash-ghost"
                        @start="draggingCount += 1"
                        @end="draggingCount -= 1"
                      >
                        <template #item="item">
                          {{ item }}
                        </template>
                      </draggable>
                    </div>
                  </template>
                  <template #wrapper>
                    <page-overflow-observer
                      :freeze="draggingCount > 0"
                      :render-mm-pixels="renderMmPixels"
                      @update:overflow="page.onOverflowUpdate"
                    />
                  </template>
                </page-render>
              </template>
            </preview-render>
            <div class="absolute-top-right q-ma-sm">
              <q-btn
                v-if="draggingCount <= 0"
                color="negative"
                icon="mdi-file-remove"
                round
                size="md"
                :disable="page.elements.length !== 0 || pageItems.length === 1"
                @click="removePage(pageIndex)"
              >
                <q-tooltip>Remove page</q-tooltip>
              </q-btn>
              <q-tooltip v-if="pageItems.length === 1">
                Cannot remove all pages
              </q-tooltip>
              <q-tooltip v-else-if="page.elements.length !== 0">
                Cannot remove page with content
              </q-tooltip>
            </div>
            <div
              v-if="page.overflow"
              class="create-test__page-overflow-info"
            >
              Page content exceeds page height
            </div>
          </div>
        </div>
        <div class="row justify-center q-mb-lg q-gutter-md">
          <q-btn
            color="primary"
            icon="mdi-file-plus"
            label="Add page"
            @click="addPage"
          />
          <q-btn
            color="primary"
            icon="mdi-check"
            label="Finish"
            outline
          >
            <q-popup-proxy
              anchor="top right"
              self="bottom right"
              :offset="[0, 8]"
              :persistent="createTestLoading"
            >
              <q-card>
                <q-form @submit.prevent="onCreateSubmit">
                  <q-card-section class="q-pb-none">
                    <q-input
                      v-model="testName"
                      label="Test name"
                      filled
                      autofocus
                    />
                  </q-card-section>
                  <q-card-actions align="right">
                    <q-btn
                      color="primary"
                      type="submit"
                      :disable="testNameInvalid"
                      :loading="createTestLoading"
                    >
                      Create
                    </q-btn>
                  </q-card-actions>
                </q-form>
              </q-card>
            </q-popup-proxy>
          </q-btn>
        </div>
      </q-scroll-area>
    </div>
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
import QuestionVariantPicker from 'components/createTest/QuestionVariantPicker.vue';
import RenderQuestion from 'components/render/RenderQuestion.vue';
import Draggable from 'vuedraggable';
import PageOverflowObserver from 'components/render/PageOverflowObserver.vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import QuestionPicker from '../components/createTest/QuestionPicker.vue';
import PageRender from '../components/render/PageRender.vue';
import { DefaultsMap, typed, useStorage } from '../utils';
import FullHeightPage from '../components/FullHeightPage.vue';

type DraggableChangeEvent<T> = {
  added: {
    newIndex: number;
    element: T;
  };
} | {
  removed: {
    oldIndex: number;
    element: T;
  };
} | {
  moved: {
    newIndex: number;
    oldIndex: number;
    element: T;
  };
}

interface Page {
  idElements: PageIdElement[];
  overflow: boolean;
}

interface PageItem {
  elements: PageElement[];
  overflow: boolean;
  onVariantPicked: (elementIndex: number, variant: number) => void;
  onQuestionOrderChange: (event: DraggableChangeEvent<PageElement>) => void;
  onOverflowUpdate: (overflow: boolean) => void;
}

export default defineComponent({
  components: {
    PageOverflowObserver,
    RenderQuestion,
    QuestionVariantPicker,
    PreviewRender,
    PageRender,
    QuestionPicker,
    FullHeightPage,
    Draggable,
  },
  setup() {
    const quasar = useQuasar();
    const i18n = useI18n();

    const pages = ref<Page[]>([{ idElements: [], overflow: false }]);

    const usedQuestions = computed(() => {
      const map = new DefaultsMap<string, Set<string>>(() => new Set());
      pages.value.forEach((page) => page.idElements.forEach((item) => {
        if (item.type === 'question') map.get(item.questionSetShortId).add(item.questionShortId);
      }));
      return map;
    });
    const questionsMap = reactive(new Map<string, QuestionWithIds[] | null>());

    const testName = ref('');
    const testNameInvalid = computed(() => testName.value.trim() === '');
    const createTestLoading = ref(false);
    return {
      questionsMap,
      splitter: useStorage<number>('create-test-splitter-position', () => 40),
      pages,
      usedQuestions,
      draggingCount: ref(0),
      pageItems: computed<PageItem[]>(() => {
        let questionCounter = 0;
        return pages.value.map((page, pageIndex) => ({
          elements: page.idElements.map((element) => {
            switch (element.type) {
              case 'question': {
                const itemBase = {
                  type: 'question',
                  number: questionCounter,
                  key: `${element.questionSetShortId} ${element.questionShortId}`,
                  idElement: element,
                } as const;
                questionCounter += 1;
                // TODO: Fix O(n^2) complexity
                const question = questionsMap
                  .get(element.questionSetShortId)
                  ?.find((question1) => question1.shortId === element.questionShortId);
                if (question === undefined) throw new Error('Question set not found');
                switch (question.type) {
                  case 'open':
                    return typed<QuestionElementOpen>({
                      ...itemBase,
                      maxPoints: question.maxPoints,
                      questionType: 'open',
                      variants: question.variants.map((variant) => ({
                        type: 'open',
                        content: variant.content,
                      })),
                    });
                  case 'quiz':
                    return typed<QuestionElementQuiz>({
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
          }),
          onVariantPicked: (elementIndex, variant) => {
            pages.value[pageIndex].idElements[elementIndex].variant = variant;
          },
          onQuestionOrderChange: (event) => {
            if ('removed' in event) {
              pages.value[pageIndex].idElements
                .splice(event.removed.oldIndex, 1);
            } else if ('added' in event) {
              pages.value[pageIndex].idElements
                .splice(event.added.newIndex, 0, event.added.element.idElement);
            } else if ('moved' in event) {
              pages.value[pageIndex].idElements
                .splice(event.moved.oldIndex, 1);
              pages.value[pageIndex].idElements
                .splice(event.moved.newIndex, 0, event.moved.element.idElement);
            }
          },
          onOverflowUpdate: (overflow) => {
            pages.value[pageIndex].overflow = overflow;
          },
          overflow: page.overflow,
        }));
      }),
      addPage: () => {
        pages.value.push({ idElements: [], overflow: false });
      },
      removePage: (pageIndex: number) => {
        pages.value.splice(pageIndex, 1);
      },
      onAddQuestion: (questionSetShortId: string, questionShortId: string, variants: string[]) => {
        pages.value[pages.value.length - 1].idElements.push({
          type: 'question',
          questionSetShortId,
          questionShortId,
          variants,
          variant: 0,
        });
      },
      testName,
      testNameInvalid,
      createTestLoading,
      onCreateSubmit: () => {
        if (testNameInvalid.value) return;
        if (pages.value.some((page) => page.overflow)) {
          quasar.notify({
            type: 'negative',
            message: i18n.t('createTest.submitErrorOverflow'),
          });
        }
        createTestLoading.value = true;
        try {
          // TODO: Create
          // TODO: Redirect
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: i18n.t('createTest.createTestError'),
          });
        }
        createTestLoading.value = false;
      },
    };
  },
});
</script>

<style lang="scss">
@import "src/css/render";

.create-test {
  .create-test__question-picker {
    width: 300px;
  }

  .create-test__page {
    max-width: 450px;
    border-radius: $generic-border-radius;

    &.create-test__page--overflow {
      outline: $negative 2px solid;
    }

    .create-test__page-overflow-info {
      background: $negative;
      color: white;
      text-align: center;
      padding: 4px;
    }
  }

  .create-test__trash {
    position: absolute;
    top: render-mm(3);
    left: render-mm(3);
    width: calc(100% - #{render-mm(6)});
    height: calc(100% - #{render-mm(6)});
    background-color: rgba($negative, 40%);
    border: render-mm(1) solid $negative;
    border-radius: render-mm(2);
    backdrop-filter: blur(2px);
    display: grid;

    .create-test__trash-zone {
      grid-column: 1;
      grid-row: 1;
    }

    .create-test__trash-body {
      grid-column: 1;
      grid-row: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: render-mm(20);
    }
  }

  .create-test__trash-ghost {
    display: none;
  }

  .create-test__render-question {
    cursor: grab;

    &.create-test__render-question--dragging {
      .render-question__label-question-text {
        filter: blur(render-mm(0.75));
      }
    }
  }
}
</style>
