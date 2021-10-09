<template>
  <q-popup-proxy
    ref="dialog"
    v-model="show"
    :offset="[0, 8]"
    :persistent="renaming"
    no-refocus
  >
    <q-card>
      <!-- TODO: Put previous name in input -->
      <folder-name-form
        :title="$t('renameFolder.title')"
        :confirm-button-label="$t('renameFolder.button')"
        :submit="renameFolderSubmit"
        :loading="renaming"
      />
    </q-card>
  </q-popup-proxy>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QDialog, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { renameFolder } from 'src/api';
import { getTypeValidator } from 'src/utils';
import FolderNameForm from 'components/FolderNameForm.vue';

export default defineComponent({
  components: { FolderNameForm },
  props: {
    folderId: {
      type: String,
      required: true,
    },
  },
  emits: {
    renamed: getTypeValidator<string>(),
  },
  setup(props, { emit }) {
    const $q = useQuasar();
    const $i18n = useI18n();
    const show = ref(false);
    const renaming = ref(false);
    const dialog = ref<QDialog | null>(null);
    return {
      show,
      renaming,
      dialog,
      renameFolderSubmit: async (name: string) => {
        renaming.value = true;
        try {
          await renameFolder(name, props.folderId);
          dialog.value?.hide();
          emit('renamed', name);
        } catch (error) {
          console.error(error);
          $q.notify({
            type: 'negative',
            message: $i18n.t('renameFolder.error'),
          });
        }
        renaming.value = false;
      },
    };
  },
});
</script>
