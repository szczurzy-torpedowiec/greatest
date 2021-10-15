<template>
  <q-popup-proxy
    v-model="show"
    :persistent="loading"
  >
    <q-card>
      <q-card-section class="q-pb-none">
        {{ $t('common.deleteConfirmation') }}
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          color="negative"
          autofocus
          :label="$t('common.delete')"
          :loading="loading"
          @click="onConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-popup-proxy>
</template>

<script lang="ts">
import {
  defineComponent, PropType, ref,
} from 'vue';

export default defineComponent({
  name: 'DeleteConfirmMenu',
  props: {
    submit: {
      type: Function as PropType<() => Promise<void>>,
      required: true,
    },
  },
  setup(props) {
    const show = ref(false);
    const loading = ref(false);
    return {
      show,
      loading,
      async onConfirm() {
        loading.value = true;
        try {
          await props.submit();
          show.value = false;
        } catch (error) {
          console.error('Unhandled error in delete confirm submit function:');
          console.error(error);
        }
        loading.value = false;
      },
    };
  },
});
</script>

<style scoped>

</style>
