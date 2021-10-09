<template>
  <q-card>
    <q-card-section horizontal>
      <q-card-section class="col">
        <div class="text-h6">
          {{ title }}
        </div>
        <div class="text-subtitle1">
          {{ $tc('datasets.question', 2) }}
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn
          outline
          color="primary"
          :label="$t('datasets.edit')"
          icon="edit"
        />
        <q-btn
          color="primary"
          :label="$t('datasets.use')"
        />
      </q-card-actions>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import {
  defineComponent,
} from 'vue';

export default defineComponent({
  name: 'DatasetListElement',
  props: {
    title: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
});
</script>

<style scoped>

</style>
