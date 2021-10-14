<template>
  <q-popup-proxy
    v-model="show"
    anchor="bottom right"
    self="top right"
    :offset="[0, 4]"
    :persistent="loading"
    no-refocus
    @before-show="onBeforeShow"
  >
    <q-card>
      <q-form @submit.prevent="onSubmit">
        <q-card-section class="q-pb-none">
          <q-input
            v-model="input"
            filled
            :label="$t('test.scans.setStudent.inputLabel')"
            autofocus
            :hint="$t('test.scans.setStudent.hint')"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            color="primary"
            :loading="loading"
          >
            {{ $t('common.save') }}
          </q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-popup-proxy>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
    submit: {
      type: Function as PropType<(name: string) => Promise<void>>,
      required: true,
    },
  },
  setup(props) {
    const quasar = useQuasar();
    const i18n = useI18n();

    const input = ref('');
    const loading = ref(false);
    const show = ref(false);
    return {
      input,
      loading,
      show,
      onBeforeShow() {
        input.value = props.name;
      },
      async onSubmit() {
        try {
          if (input.value.trim() !== props.name) {
            loading.value = true;
            await props.submit(input.value.trim());
          }
          show.value = false;
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: i18n.t('test.scans.setStudent.error'),
          });
        }
        loading.value = false;
      },
    };
  },
});
</script>
