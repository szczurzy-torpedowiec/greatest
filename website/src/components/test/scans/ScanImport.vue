<template>
  <div class="q-ma-md">
    <q-uploader
      style="width: 100%"
      :url="`/api/tests/${$route.params.testShortId}/scans/upload`"
      multiple
      auto-upload
      field-name="file"
      :accept="['image/bmp', 'image/jpeg', 'image/png', 'image/webp'].join(', ')"
      :form-fields="() => [{name: 'requestId', value: uid()}]"
      :label="$t('test.scans.addScans')"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
} from 'vue';
import { uid } from 'quasar';

export default defineComponent({
  name: 'ScanImport',
  setup() {
    return {
      uid,
    };
  },
});
</script>
