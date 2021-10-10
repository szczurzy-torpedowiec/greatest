<template>
  <q-menu>
    <div class="q-pa-md">
      {{ $t('common.deleteConfirmation') }}
      <div class="row justify-end q-mt-sm">
        <q-btn
          v-close-popup
          color="red"
          :label="$t('common.delete')"
          @click="$emit('confirm')"
        />
      </div>
    </div>
  </q-menu>
</template>

<script lang="ts">
import {
  defineComponent,
} from 'vue';

export default defineComponent({
  name: 'DeleteConfirmMenu',
  emits: ['confirm'],
});
</script>

<style scoped>

</style>
