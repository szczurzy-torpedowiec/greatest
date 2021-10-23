<template>
  <q-page padding>
    <q-card
      v-for="test in tests"
      :key="test.shortId"
      class="q-mb-md"
    >
      <span class="q-focus-helper" />
      <q-card-section horizontal>
        <q-card-section
          v-ripple
          class="text-h6 col q-hoverable cursor-pointer"
        >
          {{ test.name }}
        </q-card-section>
        <q-card-actions>
          <q-btn
            flat
            icon="delete"
            color="red"
          >
            <delete-confirm-menu :submit="deleteTest" />
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
        icon="mdi-plus"
        color="primary"
        :label="$t('tests.createTest')"
        to="/teacher/create-test"
      />
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
} from 'vue';

import { listTests } from 'src/api';

import DeleteConfirmMenu from 'components/DeleteConfirmMenu.vue';

import { useI18n } from 'vue-i18n';
import { useTitleState } from 'src/state/title';
import { useQuasar } from 'quasar';

interface ListTest {
  shortId: string,
  name: string,
  createdOn: string,
}

export default defineComponent({
  name: 'Tests',
  components: {
    DeleteConfirmMenu,
  },
  setup() {
    const tests = ref<ListTest[]>();

    const i18n = useI18n();
    const quasar = useQuasar();

    async function loadTests() {
      try {
        tests.value = (await listTests()).tests;
      } catch (error) {
        quasar.notify({
          type: 'negative',
          message: i18n.t('tests.listTestsError'),
        });
      }
    }

    async function deleteTest() {
      // TODO: Add test deletion
    }

    onMounted(loadTests);

    useTitleState(computed(() => i18n.t('tests.tests')));

    return { tests, deleteTest };
  },
});
</script>

<style scoped>

</style>
