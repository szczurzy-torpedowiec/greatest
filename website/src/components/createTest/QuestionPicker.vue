<template>
  <div class="full-height column question-picker">
    <div class="q-pa-sm">
      <q-select
        v-model="selectedQuestionSet"
        :loading="questionSetOptions === null"
        filled
        :options="questionSetOptions"
        :label="$t('createTest.questionSet')"
      />
    </div>
    <q-separator />
    <div
      v-if="selectedQuestionSet === null"
      class="flex-grow column justify-center"
    >
      <div class="text-h6 text-center q-px-sm q-py-lg text-grey-8">
        {{ $t('createTest.setNotSelected') }}
      </div>
    </div>
    <div
      v-else
      class="flex-grow full-width"
    >
      <q-scroll-area class="full-height full-width scrollarea-full-width overflow-hidden">
        <q-skeleton
          v-if="selectedSetQuestions === null"
          type="rect"
          height="80px"
          class="q-ma-sm"
        />
        <q-list
          v-else
          separator
        >
          <q-item
            v-for="question in selectedSetQuestions"
            :key="question.shortId"
            clickable
            :disable="question.disable"
            class="question-picker__question"
            @click="onAddQuestion(selectedQuestionSet.value, question)"
          >
            <preview-render
              reduced
              class="full-width"
            >
              <render-question-content
                :variants="question.variants"
                :variant="0"
              />
            </preview-render>
          </q-item>
        </q-list>
        <q-separator />
      </q-scroll-area>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed, defineComponent, onMounted, PropType, ref, watch,
} from 'vue';
import { QuestionSet, QuestionWithIds } from 'greatest-api-schemas';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { getQuestionSet, listQuestionSets } from 'src/api';
import PreviewRender from 'components/render/PreviewRender.vue';
import { DefaultsMap, getTypeValidator } from 'src/utils';
import RenderQuestionContent from 'components/render/RenderQuestionContent.vue';
import { RenderVariantOpen, RenderVariantQuiz } from 'components/render/types';

interface QuestionVariantOpen extends RenderVariantOpen {
  shortId: string;
}

interface QuestionVariantQuiz extends RenderVariantQuiz {
  shortId: string;
}

interface QuestionItemBase {
  shortId: string;
  disable: boolean;
}

interface QuestionItemOpen extends QuestionItemBase {
  variants: QuestionVariantOpen[];
}

interface QuestionItemQuiz extends QuestionItemBase {
  variants: QuestionVariantQuiz[];
}

type QuestionItem = QuestionItemOpen | QuestionItemQuiz;

export default defineComponent({
  components: { RenderQuestionContent, PreviewRender },
  props: {
    usedQuestions: {
      type: Object as PropType<DefaultsMap<string, Set<string>>>,
      required: true,
    },
    questionsMap: {
      type: Object as PropType<Map<string, QuestionWithIds[] | null>>,
      required: true,
    },
  },
  emits: {
    addQuestion: getTypeValidator<[
      questionSetShortId: string,
      questionShortId: string,
      variants: string[],
    ]>(),
  },
  setup(props, { emit }) {
    const quasar = useQuasar();
    const i18n = useI18n();

    const questionSets = ref<QuestionSet[] | null>(null);
    const selectedQuestionSet = ref<{
      label: string;
      value: string;
    } | null>(null);

    onMounted(async () => {
      try {
        const response = await listQuestionSets();
        questionSets.value = response.questionSets;
      } catch (error) {
        console.error(error);
        quasar.notify({
          type: 'negative',
          message: i18n.t('createTest.loadQuestionSetsError'),
        });
      }
    });
    watch(selectedQuestionSet, async (value) => {
      if (value === null) return;
      const setShortId = value.value;
      if (props.questionsMap.has(setShortId)) return;
      props.questionsMap.set(setShortId, null);
      try {
        const response = await getQuestionSet(setShortId);
        props.questionsMap.set(setShortId, response.questions);
      } catch (error) {
        console.error(error);
        props.questionsMap.delete(setShortId);
        quasar.notify({
          type: 'negative',
          message: i18n.t('createTest.loadQuestionsError'),
        });
      }
    });

    return {
      questionSets,
      selectedQuestionSet,
      questionSetOptions: computed(() => {
        if (questionSets.value === null) return null;
        return questionSets.value.map((questionSet) => ({
          label: questionSet.name,
          value: questionSet.shortId,
        }));
      }),
      selectedSetQuestions: computed<QuestionItem[] | null>(() => {
        if (selectedQuestionSet.value === null) return null;
        const questionSetShortId = selectedQuestionSet.value.value;
        return props.questionsMap.get(questionSetShortId)
          ?.map((question) => {
            const baseItem = {
              shortId: question.shortId,
              disable: props.usedQuestions
                .get(questionSetShortId)
                .has(question.shortId),
            };
            switch (question.type) {
              case 'quiz': return {
                ...baseItem,
                type: 'quiz',
                variants: question.variants.map((variant) => ({
                  shortId: variant.shortId,
                  content: variant.content,
                  answers: [variant.correctAnswer, ...variant.incorrectAnswers],
                  type: 'quiz',
                })),
              };
              case 'open': return {
                ...baseItem,
                type: 'open',
                variants: question.variants.map((variant) => ({
                  shortId: variant.shortId,
                  content: variant.content,
                  type: 'open',
                })),
              };
            }
          }) ?? null;
      }),
      onAddQuestion: (questionSetShortId: string, question: QuestionItem) => {
        emit(
          'addQuestion',
          questionSetShortId,
          question.shortId,
          question.variants.map((variant) => variant.shortId),
        );
      },
    };
  },
});
</script>

<style lang="scss">
.question-picker {
  .question-picker__question {
    min-height: initial;
  }
}
</style>
