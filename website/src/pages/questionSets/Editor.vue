<template>
  <q-page padding>
    <q-card v-if="questionSet === null">
      <q-skeleton
        class="q-my-md"
        height="100px"
      />
    </q-card>
    <question-set-question
      v-for="question in questionSet.questions"
      v-else
      :key="question.shortId"
      :question="question"
      @update-questions="updateQuestions"
    />
    <div class="row justify-evenly">
      <q-btn
        :disable="questionSet === null"
        class="col-5"
        color="primary"
        :label="$t('questionSets.addOpenQuestion')"
        @click="addQuestion('open')"
      />
      <q-btn
        :disable="questionSet === null"
        class="col-5"
        color="primary"
        :label="$t('questionSets.addQuizQuestion')"
        @click="addQuestion('quiz')"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import {
  computed,
  defineComponent, ref, watch,
} from 'vue';
import { useRoute } from 'vue-router';
import QuestionSetQuestion from 'components/questionSets/QuestionSetQuestion.vue';
import { getQuestionSet, createQuestion } from 'src/api';
import { GetQuestionSetReply } from 'greatest-api-schemas';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { TitleLoading, useTitleState } from 'src/state/title';

export default defineComponent({
  name: 'PageQuestionSetEditor',
  components: {
    QuestionSetQuestion,
  },
  setup() {
    const route = useRoute();
    const quasar = useQuasar();
    const i18n = useI18n();

    const questionSetId = ref(route.params.id as string);
    const questionSet = ref<GetQuestionSetReply | null>(null);

    watch(() => route.params.id as string | undefined, (value) => {
      if (value !== undefined) questionSetId.value = value;
    });
    const updateQuestions = async () => {
      try {
        questionSet.value = null;
        questionSet.value = await getQuestionSet(questionSetId.value);
      } catch (error) {
        console.error(error);
        quasar.notify({
          type: 'negative',
          message: i18n.t('questionSets.updateQuestionsError'),
        });
      }
    };
    watch(questionSetId, () => updateQuestions(), { immediate: true });
    useTitleState(computed(() => {
      if (questionSet.value === null) return TitleLoading;
      return i18n.t('questionSets.editTitle', { name: questionSet.value.name });
    }));

    async function addQuestion(type: 'open' | 'quiz') {
      await createQuestion(route.params.id as string, {
        type,
        maxPoints: 0,
        variants: [],
      });
      await updateQuestions();
    }

    return {
      updateQuestions,
      addQuestion,
      questionSet,
    };
  },
});
</script>
