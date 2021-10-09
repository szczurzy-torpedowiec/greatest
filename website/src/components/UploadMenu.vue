<template>
  <q-card
    class="overflow-hidden"
  >
    <q-uploader
      :url="`/api/folders/${$route.params.folderId}/upload-image`"
      :form-fields="[
        {name: 'capturedOn', value: capturedOn}
      ]"
      multiple
      auto-upload
      field-name="file"
      :accept="['image/bmp', 'image/jpeg', 'image/png', 'image/webp'].join(', ')"
      :headers="uploadHeaders"
      flat
      square
      :readonly="!capturedOnValid"
      @start="onUploadStart"
      @finish="onUploadFinish"
      @uploaded="onFileUploaded"
    >
      <template #header="scope">
        <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
          <q-spinner
            v-if="scope.isUploading"
            class="q-uploader__spinner"
          />
          <q-btn
            v-else-if="scope.uploadedFiles.length > 0"
            icon="done_all"
            round
            dense
            flat
            @click="scope.removeUploadedFiles"
          >
            <q-tooltip>{{ $t('uploadImages.removeUploaded') }}</q-tooltip>
          </q-btn>
          <div class="col">
            <div class="q-uploader__title">
              {{ $t('uploadImages.title') }}
            </div>
            <div class="q-uploader__subtitle">
              {{ $t('uploadImages.subtitle', {
                progress: scope.uploadProgressLabel,
                size: scope.uploadSizeLabel
              }) }}
            </div>
          </div>
          <q-btn
            v-if="scope.canAddFiles"
            type="a"
            icon="mdi-file-plus"
            round
            dense
            flat
          >
            <q-uploader-add-trigger />
            <q-tooltip>{{ $t('uploadImages.pickFiles') }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="scope.canUpload"
            icon="mdi-cloud-upload"
            round
            dense
            flat
            @click="scope.upload"
          >
            <q-tooltip>{{ $t('uploadImages.upload') }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="!scope.isUploading"
            icon="mdi-close"
            round
            dense
            flat
            @click="onClose"
          >
            <q-tooltip>{{ $t('uploadImages.close') }}</q-tooltip>
          </q-btn>
        </div>
      </template>
    </q-uploader>
    <q-separator />
    <div class="q-pa-sm">
      <q-form>
        <q-input
          v-model="capturedOn"
          :label="$t('uploadImages.capturedOnInput.label')"
          filled
          mask="####-##-##"
          fill-mask
          :hint="$t('uploadImages.capturedOnInput.hint')"
          :error-message="$t('uploadImages.capturedOnInput.error')"
          :error="!capturedOnValid"
        >
          <template #append>
            <q-icon
              name="event"
              class="cursor-pointer"
            >
              <q-popup-proxy
                ref="qDateProxy"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="capturedOn"
                  :mask="dateFormat"
                >
                  <div class="row items-center justify-end">
                    <q-btn
                      v-close-popup
                      :label="$t('close')"
                      color="primary"
                      flat
                    />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </q-form>
    </div>
  </q-card>
</template>

<script lang="ts" setup>
import {
  computed, ref, defineEmits, watch,
} from 'vue';
import { date } from 'quasar';
import { UploadImageReply } from 'greatest-api-schemas';

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'isUploading', value: boolean): void,
  (e: 'uploaded', reply: UploadImageReply): void,
}>();

const uploadHeaders: {name: string, value: string}[] = [
  { name: 'accept', value: 'application/json' },
];
const dateFormat = 'YYYY-MM-DD';

const capturedOn = ref(date.formatDate(new Date(), dateFormat));
const capturedOnValid = computed(() => {
  const extractedDate = date.extractDate(capturedOn.value, 'YYYY-MM-DD');
  return date.formatDate(extractedDate, 'YYYY-MM-DD') === capturedOn.value;
});
const isUploading = ref(false);
watch(isUploading, (value) => {
  emit('isUploading', value);
});
const onUploadStart = () => { isUploading.value = true; };
const onUploadFinish = () => { isUploading.value = false; };
const onFileUploaded = (info: {xhr: XMLHttpRequest}) => {
  const reply = JSON.parse(info.xhr.responseText) as UploadImageReply;
  emit('uploaded', reply);
};
const onClose = () => {
  emit('close');
};
</script>
