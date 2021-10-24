<template>
  <q-page v-if="$q.screen.lt.sm">
    <scan-import :test-short-id="testShortId" />
    <scan-list
      :sheets="sheets"
      :scans="scans"
      :test-short-id="testShortId"
    />
    <q-dialog
      :model-value="selectedScan !== null"
      no-route-dismiss
      maximized
      @before-hide="onDialogHide"
    >
      <q-card class="column no-wrap">
        <scan-details
          :sheets="sheets"
          :test-short-id="testShortId"
          :scan="selectedScan"
          full-screen
        />
      </q-card>
    </q-dialog>
  </q-page>
  <full-height-page v-else>
    <q-splitter
      v-model="splitter"
      class="full-height"
      :limits="[20, 80]"
    >
      <template #before>
        <div
          v-if="selectedScan === null"
          class="full-height bg-dark text-white text-center column justify-center q-pa-sm"
        >
          <div class="text-h6">
            {{ $t('test.scans.notSelected') }}
          </div>
        </div>
        <div
          v-else
          class="full-height column no-wrap"
        >
          <scan-details
            :sheets="sheets"
            :test-short-id="testShortId"
            :scan="selectedScan"
          />
        </div>
      </template>
      <template #after>
        <q-scroll-area class="full-height overflow-hidden">
          <scan-import :test-short-id="testShortId" />
          <scan-list
            :sheets="sheets"
            :scans="scans"
            :test-short-id="testShortId"
          />
        </q-scroll-area>
      </template>
    </q-splitter>
  </full-height-page>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType,
} from 'vue';
import { useStorage } from 'src/utils';
import { Scan, Sheet } from 'greatest-api-schemas';
import { useRoute, useRouter } from 'vue-router';
import { getScanImageUrl } from 'src/api';
import ScanDetails from 'components/test/scans/ScanDetails.vue';
import ScanList from 'components/test/scans/ScanList.vue';
import FullHeightPage from 'components/FullHeightPage.vue';
import ScanImport from 'components/test/scans/ScanImport.vue';

export default defineComponent({
  components: {
    FullHeightPage, ScanList, ScanDetails, ScanImport,
  },
  props: {
    scans: {
      type: Array as PropType<Scan[] | null>,
      default: null,
    },
    sheets: {
      type: Array as PropType<Sheet[] | null>,
      default: null,
    },
    testShortId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();

    const selectedScan = computed(() => {
      if (props.scans === null || !('scanShortId' in route.params)) return null;
      const scan = props.scans.find((el) => el.shortId === route.params.scanShortId);
      if (scan === undefined) return null;
      return {
        ...scan,
        scanImageUrl: getScanImageUrl(props.testShortId, scan.shortId),
      };
    });
    return {
      splitter: useStorage<number>('scans-splitter-position', () => 80),
      selectedScan,
      onDialogHide: async () => {
        if ('scanShortId' in route.params) await router.push(`/teacher/tests/${props.testShortId}/scans`);
      },
    };
  },
});
</script>
