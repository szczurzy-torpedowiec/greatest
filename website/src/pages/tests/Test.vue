<template>
  <q-tab-panels
    :model-value="tab"
    animated
  >
    <q-tab-panel name="questions">
      <router-view />
    </q-tab-panel>
    <q-tab-panel name="sheets">
      <router-view
        :sheets="sheets"
        :scans="scans"
        :test-short-id="testShortId"
        @add-ignored-request-id="onAddIgnoredRequestId"
        @sheet-student-changed="onSheetStudentChanged"
        @sheets-created="onSheetsCreated"
        @sheet-deleted="onSheetDeleted"
      />
    </q-tab-panel>
    <q-tab-panel
      name="scans"
      class="q-pa-none"
    >
      <router-view
        :sheets="sheets"
        :scans="scans"
        :test-short-id="testShortId"
      />
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
import { TestToolbarState, useTestToolbarState } from 'src/state/test-toolbar';
import { TitleLoading, useTitleState } from 'src/state/title';

export default defineComponent({
  setup() {
    const route = useRoute();
    const quasar = useQuasar();
    const i18n = useI18n();
    const testShortId = ref(route.params.testShortId as string);
    const getTab = () => firstNotUndefined(route.matched,
      (matched) => matched.meta.testTab) ?? null;
    const tab = computed(getTab);
    watch(() => route.params.testShortId as string | undefined, (value) => {
      if (value !== undefined) testShortId.value = value;
    });
    const test = ref<GetTestReply | null>(null);
    const sheets = ref<Sheet[] | null>(null);
    const scans = ref<Scan[] | null>(null);
    const websocket = useTestWebsocket(testShortId);
    const ignoredRequestIds = ref(new Set<string>());
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
    const deleteSheet = (sheetShortId: string) => {
      sheets.value = sheets.value?.filter(
        (sheet) => sheet.shortId !== sheetShortId,
      ) ?? null;
    };
    const deleteScan = (scanShortId: string) => {
      scans.value = scans.value?.filter(
        (scan) => scan.shortId !== scanShortId,
      ) ?? null;
    };
    websocket.onMessage((message) => {
      if (ignoredRequestIds.value.has(message.causingRequestId)) return;
      if (message.type === 'sheet-create') sheets.value?.push(message.sheet);
      else if (message.type === 'scan-create') scans.value?.push(message.scan);
      else if (message.type === 'sheet-change') {
        if (sheets.value === null) return;
        const index = sheets.value.findIndex((sheet) => sheet.shortId === message.sheet.shortId);
        sheets.value[index] = message.sheet;
      } else if (message.type === 'scan-change') {
        if (scans.value === null) return;
        const index = scans.value.findIndex((scan) => scan.shortId === message.scan.shortId);
        scans.value[index] = message.scan;
      } else if (message.type === 'sheet-delete') deleteSheet(message.sheetShortId);
      else if (message.type === 'scan-delete') deleteScan(message.scanShortId);
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
    useTestToolbarState(computed<TestToolbarState>(() => ({
      unassignedScanCount: scans.value?.reduce(
        (count, scan) => count + (scan.sheet === null ? 1 : 0), 0,
      ) ?? null,
      testShortId: testShortId.value,
    })));
    useTitleState(computed(
      () => {
        if (test.value === null) return TitleLoading;
        return i18n.t('test.title', { name: test.value.name });
      },
    ));
    return {
      test,
      tab,
      scans,
      sheets,
      testShortId,
      onAddIgnoredRequestId: (requestId: string) => {
        ignoredRequestIds.value.add(requestId);
      },
      onSheetStudentChanged: (sheetShortId: string, student: string) => {
        const sheet = sheets.value?.find((item) => item.shortId === sheetShortId);
        if (sheet !== undefined) sheet.student = student;
      },
      onSheetsCreated: (newSheets: Sheet[]) => {
        sheets.value?.push(...newSheets);
      },
      onSheetDeleted: (sheetShortId: string) => {
        deleteSheet(sheetShortId);
      },
    };
  },
});
</script>
