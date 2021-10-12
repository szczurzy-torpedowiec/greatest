<template>
  <q-page padding>
    <h2>Tests</h2>
    <q-card
      v-for="test in tests"
      :key="test.shortId"
      class="q-mb-md"
    >
      <span class="q-focus-helper" />
      <q-card-section horizontal>
        <q-card-section class="text-h6 col q-hoverable cursor-pointer" v-ripple>
          {{ test.name }}
        </q-card-section>
        <q-card-actions>
          <q-btn
            flat
            icon="delete"
            color="red"
          >
            <delete-confirm-menu />
          </q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card>
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn
        fab
        icon="add"
        color="primary"
        label="New test"
      >
        <test-settings />
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
} from 'vue';

import { listTests } from 'src/api';

import TestSettings from 'components/tests/TestSettings.vue';
import DeleteConfirmMenu from 'components/DeleteConfirmMenu.vue';

interface ListTest {
  shortId: string,
  name: string,
  createdOn: string,
}

export default defineComponent({
  name: 'Tests',
  components: {
    TestSettings,
    DeleteConfirmMenu,
  },
  setup() {
    const tests = ref<ListTest[]>();

    async function loadTests() {
      tests.value = (await listTests()).tests;
    }

    async function deleteTest() {
      // TODO: Add test deletion
    }

    onMounted(loadTests);

    return { tests };
  },
});
</script>

<style scoped>

</style>
