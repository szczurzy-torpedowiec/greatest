<template>
  <q-tab-panels
    :model-value="tab"
    animated
  >
    <q-tab-panel name="questions">
      <router-view />
    </q-tab-panel>
    <q-tab-panel name="sheets">
      <router-view />
    </q-tab-panel>
    <q-tab-panel name="scans">
      <router-view />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script lang="ts">
import {
  computed,
  defineComponent, ref, watch,
} from 'vue';
import { useRoute } from 'vue-router';
import {
  GetTestReply, Scan, Sheet,
} from 'greatest-api-schemas';
import { useTestWebsocket } from 'src/api/websockets';
import { getTest, listScans, listSheets } from 'src/api';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { firstNotUndefined } from 'src/utils';

export default defineComponent({
  setup() {
    const route = useRoute();
    const quasar = useQuasar();
    const i18n = useI18n();
    const testShortId = ref(route.params.testShortId as string);
    const getTab = () => firstNotUndefined(route.matched, (matched) => {
      switch (matched.name) {
        case 'test-tab-questions': return 'questions';
        case 'test-tab-sheets': return 'sheets';
        case 'test-tab-scans': return 'scans';
        default: return undefined;
      }
    }) ?? null;
    const tab = computed(getTab);
    watch(() => route.params.testShortId as string | undefined, (value) => {
      if (value !== undefined) testShortId.value = value;
    });
    const test = ref<GetTestReply | null>(null);
    const sheets = ref<Sheet[] | null>(null);
    const scans = ref<Scan[] | null>(null);
    const websocket = useTestWebsocket(testShortId);
    const loadSheets = () => {
      listSheets(testShortId.value)
        .then((reply) => { sheets.value = reply.sheets; })
        .catch((error) => {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: i18n.t('test.listSheetsError'),
          });
        });
    };
    const loadScans = () => {
      listScans(testShortId.value)
        .then((reply) => { scans.value = reply.scans; })
        .catch((error) => {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: i18n.t('test.listScansError'),
          });
        });
    };
    websocket.onConnect(() => {
      loadSheets();
      loadScans();
    });
    watch(testShortId, async (value) => {
      test.value = null;
      sheets.value = null;
      scans.value = null;
      try {
        test.value = await getTest(value);
      } catch (error) {
        console.error(error);
        quasar.notify({
          type: 'negative',
          message: i18n.t('test.loadTestError'),
        });
      }
    }, { immediate: true });
    return {
      test,
      tab,
    };
  },
});
</script>
