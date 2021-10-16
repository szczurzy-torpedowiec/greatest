<template>
  <q-menu>
    <div class="q-pa-md">
      <q-form @submit="submitNewTest">
        <q-input
          v-model="newTestName"
          class="col q-my-sm"
          outlined
          :label="$t('tests.testName')"
          :rules="[ val => val.trim() !== '' || $t('tests.testNameEmptyError')]"
        />
        <q-select
          v-model="newTestQuestionSet"
          class="col q-my-sm"
          outlined
          :label="$t('tests.questionSet')"
          :options="questionSets"
          option-label="name"
          :rules="[ val => val.questionCount >= 1 || $t('tests.questionSetEmptyError')]"
        />
        <div class="row">
          <q-space />
          <q-btn
            type="submit"
            color="primary"
            :label="$t('common.create')"
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
import { useI18n } from 'vue-i18n';

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
    const quasar = useQuasar();
    const i18n = useI18n();

    async function submitNewTest() {
      // TODO: Add loading when creating test and make menu a card
      try {
        const questionSet = (
          await getQuestionSet(newTestQuestionSet.value?.shortId as string)
        ).questions.map((question) => ({
          questionSetShortId: newTestQuestionSet.value?.shortId as string,
          questionShortId: question.shortId,
          variants: question.variants.map(
            (variant: QuestionVariantOpen | QuestionVariantQuiz) => variant.shortId,
          ),
        })).filter((question) => question.variants.length > 0);

        if (questionSet.length < 1) {
          quasar.notify({
            type: 'negative',
            message: i18n.t('tests.questionSetEmptyError'),
          });
          return;
        }
        try {
          const response = await createTest({
            name: newTestName.value,
            questions: questionSet,
          });
            // TODO: Redirect to test
        } catch (error) {
          quasar.notify({
            type: 'negative',
            message: i18n.t('tests.testCreateError'),
          });
        }
      } catch (error) {
        quasar.notify({
          type: 'negative',
          message: i18n.t('tests.getQuestionSetError'),
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
