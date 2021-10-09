<template>
  <q-page padding>
    <dataset-list-element
      title="Example dataset"
      size="35"
    />
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-fab
        icon="add"
        color="primary"
        :label="$t('datasets.new')"
      />
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent,
} from 'vue';
import DatasetListElement from 'components/datasets/DatasetListElement.vue';

export default defineComponent({
  name: 'PageDatasets',
  components: {
    DatasetListElement,
  },
});
</script>

<style scoped>

</style>
