<template>
  <q-menu>
    <div class="q-pa-md">
      <q-form @submit="submitNewTest">
        <q-input
          v-model="newTestName"
          class="col q-my-sm"
          outlined
          label="Test name"
          :rules="[ val => val && val.length > 0 || 'Podaj nazwę testu']"
        />
        <q-select
          v-model="newTestQuestionSet"
          class="col q-my-sm"
          outlined
          label="Dataset"
          :options="questionSets"
          option-label="name"
          :rules="[ val => val.questionCount >= 1 || 'Ten zestaw jest pusty']"
        />
        <div class="row">
          <q-space />
          <q-btn
            type="submit"
            color="primary"
            label="Create"
          />
        </div>
      </q-form>
    </div>
  </q-menu>
</template>

<script lang="ts">
import {
  defineComponent, onMounted, ref,
} from 'vue';

import { QuestionSet, QuestionVariantOpen, QuestionVariantQuiz } from 'greatest-api-schemas';
import { listQuestionSets, getQuestionSet, createTest } from 'src/api';

export default defineComponent({
  name: 'TestCreator',
  setup() {
    const newTestName = ref<string>('');
    const newTestQuestionSet = ref<QuestionSet>();
    const questionSets = ref<QuestionSet[]>([]);

    async function getQuestionSets() {
      questionSets.value = (await listQuestionSets()).questionSets;
    }

    onMounted(getQuestionSets);

    async function submitNewTest() {
      const questionSet = (
        await getQuestionSet(newTestQuestionSet.value?.shortId as string)
      ).questions.map((question) => ({
        questionSetShortId: newTestQuestionSet.value?.shortId as string,
        questionShortId: question.shortId,
        variants: question.variants.map(
          (variant: QuestionVariantOpen | QuestionVariantQuiz) => variant.shortId,
        ),
      }));

      await createTest({
        name: newTestName.value,
        questions: questionSet,
      });
    }

    return {
      questionSets,
      newTestQuestionSet,
      newTestName,
      submitNewTest,
    };
  },
});
</script>

<style scoped>

</style>
