<template>
  <q-page padding>
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn
        fab
        icon="add"
        color="primary"
        label="New test"
        @click="testCreator"
      >
        <test-settings />
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import {
  defineComponent,
  ref,
} from 'vue';

import TestSettings from 'components/tests/TestSettings.vue';

export default defineComponent({
  name: 'Tests',
  components: {
    TestSettings,
  },
  setup() {
    const $q = useQuasar();

    function testCreator() {
      $q.dialog({
        component: TestSettings,
      });
    }

    return { testCreator };
  },
});
</script>

<style scoped>

</style>
