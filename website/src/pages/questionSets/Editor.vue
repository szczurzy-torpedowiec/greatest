<template>
  <q-page padding>
    <question-set-question
      :question="{question: 'a', correctAnswer: 'tak', incorrectAnswers: ['nie']}"
    />
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent,
} from 'vue';
import QuestionSetQuestion from 'components/questionSets/QuestionSetQuestion.vue';

export default defineComponent({
  name: 'PageQuestionSetEditor',
  components: {
    QuestionSetQuestion,
  },
});
</script>
