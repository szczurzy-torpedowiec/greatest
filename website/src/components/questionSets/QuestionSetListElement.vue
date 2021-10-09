<template>
  <q-card>
    <q-card-section horizontal>
      <q-card-section class="col">
        <div class="text-h6">
          {{ title }}
        </div>
        <div class="text-subtitle1">
          {{ $tc('questionSets.question', 2) }}
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn
          outline
          color="primary"
          :label="$t('questionSets.edit')"
          icon="edit"
          @click="editRedirect"
        />
        <q-btn
          color="primary"
          :label="$t('questionSets.use')"
        />
      </q-card-actions>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import {
  defineComponent,
} from 'vue';

import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'QuestionSetListElement',
  props: {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();

    async function editRedirect() {
      await router.push(`/question-sets/${props.id}/edit`);
    }

    return { editRedirect };
  },
});
</script>

<style scoped>

</style>
