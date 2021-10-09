<template>
  <q-form @submit.prevent="onSubmit">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{ title }}
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-input
          v-model="name"
          autofocus
          filled
          :label="$t('folderFormName')"
          maxlength="64"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          type="submit"
          color="primary"
          :loading="loading"
          :disable="disabled"
          :label="confirmButtonLabel"
        />
      </q-card-actions>
    </q-card>
  </q-form>
</template>

<script lang="ts" setup>
import {
  computed, PropType, ref,
} from 'vue';

const props = defineProps({
  submit: {
    type: Function as PropType<(name: string) => void | Promise<void>>,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  confirmButtonLabel: {
    type: String,
    required: true,
  },
  loading: Boolean,
});
const name = ref('');
const disabled = computed(() => name.value.trim() === '');
async function onSubmit() {
  await props.submit(name.value.trim());
}
</script>
