<template>
  <q-page padding>
    <dataset-question
      :question="{question: 'a', correctAnswer: 'tak', incorrectAnswers: ['nie']}"
    />
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent,
} from 'vue';
import DatasetQuestion from 'components/datasets/DatasetQuestion.vue';

export default defineComponent({
  name: 'PageDatasetEditor',
  components: {
    DatasetQuestion,
  },
});
</script>
