<template>
  <q-page padding>
    <question-set-list-element
      v-for="questionSet in questionSets"
      :id="questionSet.shortId"
      :key="questionSet.shortId"
      :title="questionSet.name"
      size="35"
      class="q-mb-md"
    />
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn
        fab
        icon="add"
        color="primary"
        :label="$t('questionSets.new')"
      >
        <q-menu>
          <div class="q-pa-md">
            <q-input
              v-model="newQuestionSetName"
              outlined
              label="Question set name"
              @keydown.enter.prevent="submitQuestionSet"
            >
              <template #after>
                <q-btn
                  round
                  dense
                  flat
                  icon="save"
                  @click="submitQuestionSet"
                />
              </template>
            </q-input>
          </div>
        </q-menu>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
} from 'vue';
import QuestionSetListElement from 'components/questionSets/QuestionSetListElement.vue';
import { listQuestionSets, createQuestionSet } from 'src/api';
import { QuestionSet } from 'greatest-api-schemas';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'PageQuestionSets',
  components: {
    QuestionSetListElement,
  },
  setup() {
    const router = useRouter();
    const questionSets = ref<QuestionSet[] | null>(null);
    const getQuestionSets = async () => {
      questionSets.value = (await listQuestionSets()).questionSets;
    };
    const newQuestionSetName = ref<string>('');

    onMounted(getQuestionSets);

    async function submitQuestionSet() {
      const response = await createQuestionSet({
        name: newQuestionSetName.value.trim(),
      });

      await router.push(`/question-sets/${response.shortId}/edit`);
    }

    return { questionSets, newQuestionSetName, submitQuestionSet };
  },
});
</script>

<style scoped>

</style>
