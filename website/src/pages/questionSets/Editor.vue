<template>
  <q-page padding>
    <h2>{{ setName }}</h2>
    <question-set-question
      v-for="question in questionList"
      :key="question.shortId"
      :question="question"
      @update-questions="getQuestions"
    />
    <div class="row justify-evenly">
      <q-btn
        class="col-5"
        color="primary"
        :label="$t('questionSets.addOpenQuestion')"
        @click="addQuestion('open')"
      />
      <q-btn
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
  defineComponent, onMounted, ref,
} from 'vue';
import { useRoute } from 'vue-router';
import QuestionSetQuestion from 'components/questionSets/QuestionSetQuestion.vue';
import { getQuestionSet, createQuestion } from 'src/api';
import { QuestionWithIds } from 'greatest-api-schemas';

export default defineComponent({
  name: 'PageQuestionSetEditor',
  components: {
    QuestionSetQuestion,
  },
  setup() {
    const setName = ref<string>('');
    const questionList = ref<QuestionWithIds[]>();

    const route = useRoute();

    async function getQuestions() {
      questionList.value = (await getQuestionSet(route.params.id as string)).questions;
      setName.value = (await getQuestionSet(route.params.id as string)).name;
    }

    async function addQuestion(type: 'open' | 'quiz') {
      await createQuestion(route.params.id as string, {
        type,
        maxPoints: 0,
        variants: [],
      });
      await getQuestions();
    }

    onMounted(getQuestions);

    return {
      questionList, setName, addQuestion, getQuestions,
    };
  },
});
</script>
