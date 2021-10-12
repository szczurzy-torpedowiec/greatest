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
import { useQuasar } from 'quasar';

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
    const $q = useQuasar();

    async function submitNewTest() {
      const questionSet = (
        await getQuestionSet(newTestQuestionSet.value?.shortId as string)
      ).questions.map((question) => ({
        questionSetShortId: newTestQuestionSet.value?.shortId as string,
        questionShortId: question.shortId,
        variants: question.variants.map(
          (variant: QuestionVariantOpen | QuestionVariantQuiz) => variant.shortId,
        ),
      })).filter((question) => question.variants.length > 0);

      if (questionSet.length >= 1) {
        const response = await createTest({
          name: newTestName.value,
          questions: questionSet,
        });

        if (!response.shortId) {
          $q.notify({
            message: 'Unknown error while creating test',
            color: 'red',
            position: 'bottom',
          });
        } else {
          // Redirect to test
        }
      } else {
        $q.notify({
          message: 'Error while creating test: No questions',
          color: 'red',
          position: 'bottom',
        });
      }
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
