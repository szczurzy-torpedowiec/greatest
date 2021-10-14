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
    <q-card class="create-sheet-popup-card">
      <q-form @submit.prevent="onSubmit">
        <q-card-section class="q-pb-none">
          <q-input
            v-model.number="input"
            filled
            :label="$t('test.sheets.createSheets.inputLabel')"
            type="number"
            :min="1"
            :max="50"
            :step="1"
            autofocus
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
    submit: {
      type: Function as PropType<(count: number) => Promise<void>>,
      required: true,
    },
  },
  setup(props) {
    const quasar = useQuasar();
    const i18n = useI18n();

    const input = ref(1);
    const loading = ref(false);
    const show = ref(false);
    return {
      input,
      loading,
      show,
      onBeforeShow() {
        input.value = 1;
      },
      async onSubmit() {
        try {
          loading.value = true;
          await props.submit(input.value);
          show.value = false;
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: i18n.t('test.sheets.createSheets.error'),
          });
        }
        loading.value = false;
      },
    };
  },
});
</script>

<style lang="scss">
.create-sheet-popup-card {
  min-width: 200px;
}
</style>
