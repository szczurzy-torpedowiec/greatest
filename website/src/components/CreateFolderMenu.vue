<template>
  <q-popup-proxy
    v-model="show"
    fit
    :offset="[0, 8]"
    :persistent="creating"
    no-refocus
  >
    <folder-name-form
      :title="$t('createFolder.title')"
      :confirm-button-label="$t('createFolder.button')"
      :submit="createRootFolderSubmit"
      :loading="creating"
    />
  </q-popup-proxy>
</template>

<script lang="ts">
import {
  defineComponent, PropType, ref,
} from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { createRootFolder, createSubfolder } from 'src/api';
import { getTypeValidator } from 'src/utils';
import { CreateFolderReply } from 'greatest-api-schemas';
import FolderNameForm from 'components/FolderNameForm.vue';

function createFolder(name: string, parentFolderId?: string) {
  return (parentFolderId === undefined
    ? createRootFolder(name)
    : createSubfolder(name, parentFolderId));
}

export default defineComponent({
  components: { FolderNameForm },
  props: {
    parentFolderId: {
      type: String as PropType<string>,
      required: false,
      default: undefined,
    },
  },
  emits: {
    created: getTypeValidator<CreateFolderReply>(),
  },
  setup(props, { emit }) {
    const $q = useQuasar();
    const $i18n = useI18n();
    const show = ref(false);
    const creating = ref(false);
    return {
      show,
      creating,
      createRootFolderSubmit: async (name: string) => {
        creating.value = true;
        try {
          const result = await createFolder(name, props.parentFolderId);
          show.value = false;
          emit('created', result);
        } catch (error) {
          console.error(error);
          $q.notify({
            type: 'negative',
            message: $i18n.t('createFolder.error'),
          });
        }
        creating.value = false;
      },
    };
  },
});
</script>
