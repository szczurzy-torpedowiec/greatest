<template>
  <div class="full-height column">
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
            class="q-px-none"
            clickable
            :disable="question.disable"
            @click="onAddQuestion(selectedQuestionSet.value, question)"
          >
            <preview-render class="full-width">
              <render-question
                class="full-width"
                :points="question.maxPoints"
                :variants="question.variants"
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
import RenderQuestion from 'components/render/RenderQuestion.vue';
import { DefaultsMap, getTypeValidator } from 'src/utils';

export default defineComponent({
  components: { RenderQuestion, PreviewRender },
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
      selectedSetQuestions: computed(() => {
        if (selectedQuestionSet.value === null) return null;
        const questionSetShortId = selectedQuestionSet.value.value;
        return props.questionsMap.get(questionSetShortId)
          ?.map((question) => ({
            ...question,
            disable: props.usedQuestions
              .get(questionSetShortId)
              .has(question.shortId),
          })) ?? null;
      }),
      onAddQuestion: (questionSetShortId: string, question: QuestionWithIds) => {
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
