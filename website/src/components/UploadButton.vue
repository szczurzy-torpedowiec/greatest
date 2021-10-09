<template>
  <q-btn
    v-if="!show || useDialog"
    fab
    icon="mdi-upload"
    color="primary"
    class="q-ma-sm"
    @click="show = true"
  >
    <q-tooltip
      anchor="center left"
      self="center right"
      transition-show="jump-left"
      transition-hide="jump-right"
    >
      {{ $t('uploadImages.title') }}
    </q-tooltip>
  </q-btn>
  <upload-menu
    v-if="show && !useDialog"
    @close="show=false"
    @uploaded="onUploaded"
  />
  <q-dialog
    v-if="useDialog"
    v-model="show"
    :persistent="isUploading"
  >
    <upload-menu
      @close="show = false"
      @isUploading="onIsUploading"
      @uploaded="onUploaded"
    />
  </q-dialog>
</template>
<script lang="ts" setup>
import UploadMenu from 'components/UploadMenu.vue';
import { defineEmits, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { UploadImageReply } from 'greatest-api-schemas';

const quasar = useQuasar();
const emit = defineEmits<{
  (e: 'uploaded', reply: UploadImageReply): void,
}>();

const show = ref(false);
const useDialog = ref(false);
watch(() => {
  if (show.value) return null;
  const target = quasar.screen.width < 500;
  if (target === useDialog.value) return null;
  return target;
}, (value) => {
  if (value === null) return;
  useDialog.value = value;
}, {
  immediate: true,
});
const isUploading = ref(false);
const onIsUploading = (value: boolean) => { isUploading.value = value; };
const onUploaded = (reply: UploadImageReply) => {
  emit('uploaded', reply);
};
</script>
