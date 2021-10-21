<template>
  <q-page padding>
    <q-card v-if="questionSets === null">
      <q-skeleton
        class="q-mb-md"
        height="100px"
      />
    </q-card>
    <question-set-list-element
      v-for="questionSet in questionSets"
      v-else
      :id="questionSet.shortId"
      :key="questionSet.shortId"
      :title="questionSet.name"
      :question-count="questionSet.questionCount"
      class="q-mb-md"
      @update-question-sets="getQuestionSets"
    />
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn
        fab
        icon="add"
        color="primary"
        :label="$t('questionSets.newQuestionSet')"
      >
        <q-popup-proxy
          no-refocus
          :offset="[0, 8]"
          :persistent="createQuestionSetLoading"
        >
          <q-card>
            <q-form @submit.prevent="submitQuestionSet">
              <q-card-section class="q-pb-none">
                <q-input
                  v-model="newQuestionSetName"
                  filled
                  :label="$t('questionSets.questionSetName')"
                  autofocus
                />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  :label="$t('common.create')"
                  color="primary"
                  type="submit"
                  :disable="createQuestionSetDisabled"
                  :loading="createQuestionSetLoading"
                />
              </q-card-actions>
            </q-form>
          </q-card>
        </q-popup-proxy>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
} from 'vue';
import QuestionSetListElement from 'components/questionSets/QuestionSetListElement.vue';
import { listQuestionSets, createQuestionSet } from 'src/api';
import { QuestionSet } from 'greatest-api-schemas';
import { useRouter } from 'vue-router';
import { useTitleState } from 'src/state/title';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'PageQuestionSets',
  components: {
    QuestionSetListElement,
  },
  setup() {
    const router = useRouter();
    const i18n = useI18n();
    const quasar = useQuasar();

    const questionSets = ref<QuestionSet[] | null>(null);
    const getQuestionSets = async () => {
      questionSets.value = null;
      questionSets.value = (await listQuestionSets()).questionSets;
    };
    const newQuestionSetName = ref<string>('');
    const createQuestionSetLoading = ref(false);
    const createQuestionSetDisabled = computed(() => newQuestionSetName.value.trim() === '');

    onMounted(getQuestionSets);

    async function submitQuestionSet() {
      if (createQuestionSetDisabled.value || createQuestionSetLoading.value) return;
      try {
        createQuestionSetLoading.value = true;
        const response = await createQuestionSet({
          name: newQuestionSetName.value.trim(),
        });
        await router.push(`/teacher/question-sets/${response.shortId}/edit`);
      } catch (error) {
        quasar.notify({
          type: 'negative',
          message: i18n.t('questionSets.createQuestionSetError'),
        });
      }
      createQuestionSetLoading.value = false;
    }

    useTitleState(computed(() => i18n.t('questionSets.listTitle')));

    return {
      createQuestionSetDisabled,
      createQuestionSetLoading,
      questionSets,
      newQuestionSetName,
      submitQuestionSet,
      getQuestionSets,
    };
  },
});
</script>

<style scoped>

</style>
