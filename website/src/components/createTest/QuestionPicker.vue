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
  computed, defineComponent, onMounted, reactive, ref, watch,
} from 'vue';
import { QuestionSet, QuestionWithIds } from 'greatest-api-schemas';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { getQuestionSet, listQuestionSets } from 'src/api';
import PreviewRender from 'components/render/PreviewRender.vue';
import RenderQuestion from 'components/render/RenderQuestion.vue';

export default defineComponent({
  components: { RenderQuestion, PreviewRender },
  setup() {
    const quasar = useQuasar();
    const i18n = useI18n();

    const questionSets = ref<QuestionSet[] | null>(null);
    const selectedQuestionSet = ref<{
      label: string;
      value: string;
    } | null>(null);
    const questions = reactive(new Map<string, QuestionWithIds[] | null>());

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
      if (questions.has(setShortId)) return;
      questions.set(setShortId, null);
      try {
        const response = await getQuestionSet(setShortId);
        questions.set(setShortId, response.questions);
      } catch (error) {
        console.error(error);
        questions.delete(setShortId);
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
        return questions.get(selectedQuestionSet.value.value) ?? null;
      }),
    };
  },
});
</script>
