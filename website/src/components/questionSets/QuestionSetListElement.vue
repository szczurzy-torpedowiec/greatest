<template>
  <q-card>
    <q-card-section horizontal>
      <q-card-section class="col">
        <div class="text-h6">
          {{ submittedName }}
          <q-btn
            icon="edit"
            flat
          >
            <q-menu
              v-model="menuOpen"
              no-refocus
            >
              <div class="q-pa-md">
                <q-input
                  v-model="newName"
                  outlined
                  :label="$t('questionSets.questionSetName')"
                  @keydown.enter="submitName"
                >
                  <template #after>
                    <q-btn
                      v-close-popup
                      round
                      dense
                      flat
                      icon="save"
                      @click="submitName"
                    />
                  </template>
                </q-input>
              </div>
            </q-menu>
          </q-btn>
        </div>
        <div class="text-subtitle1">
          {{ $tc('questionSets.questionCount', size) }}
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn
          flat
          color="red"
          icon="delete"
        >
          <DeleteConfirmMenu @confirm="deleteSet" />
        </q-btn>
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
  ref,
} from 'vue';

import { useRouter } from 'vue-router';
import { patchQuestionSet, deleteQuestionSet } from 'src/api';
import DeleteConfirmMenu from 'components/DeleteConfirmMenu.vue';

export default defineComponent({
  name: 'QuestionSetListElement',
  components: {
    DeleteConfirmMenu,
  },
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
  emits: ['updateQuestionSets'],
  setup(props, { emit }) {
    const router = useRouter();
    const newName = ref<string>(props.title);
    const submittedName = ref<string>(props.title);
    const menuOpen = ref<boolean>(false);

    async function editRedirect() {
      await router.push(`/question-sets/${props.id}/edit`);
    }

    async function submitName() {
      await patchQuestionSet(props.id, {
        name: newName.value.trim(),
      });

      submittedName.value = newName.value;
      menuOpen.value = false;
    }

    async function deleteSet() {
      await deleteQuestionSet(props.id);
      emit('updateQuestionSets');
    }

    return {
      editRedirect,
      newName,
      submitName,
      menuOpen,
      submittedName,
      deleteSet,
    };
  },
});
</script>

<style scoped>

</style>
