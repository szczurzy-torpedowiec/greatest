<template>
  <q-page
    :style-fn="pageStyleFn"
    class="scans-tab"
  >
    <q-splitter
      v-model="splitter"
      class="full-height"
      :limits="[20, 80]"
    >
      <template #before>
        <div class="image-contain full-height">
          <img alt="Scan uploaded image"> <!-- TODO: Translate -->
        </div>
      </template>
      <template #after>
        <q-scroll-area class="full-height overflow-hidden">
          <q-item-label header>
            Unassigned scans
          </q-item-label>
          <q-item v-if="unassignedScans === null">
            <q-item-section>
              <q-item-label overline>
                <q-skeleton
                  type="text"
                  width="65%"
                />
              </q-item-label>
              <q-item-label>
                <q-skeleton
                  type="text"
                  width="50%"
                />
              </q-item-label>
            </q-item-section>
          </q-item>
          <div
            v-else-if="unassignedScans.length === 0"
            class="text-h6 text-center q-px-sm q-py-lg text-grey-8"
          >
            Great, all scans are assigned!
          </div>
          <q-list v-else>
            <q-item
              v-for="scan in unassignedScans"
              :key="scan.shortId"
              :to="scan.to"
              class="scan-item"
            >
              <div class="active-border" />
              <q-item-section>
                <q-item-label overline>
                  {{ scan.dateLabel }}
                </q-item-label>
                <q-item-label
                  v-if="scan.reason === UnassignedReason.NoDetected"
                  class="text-red"
                >
                  No sheet detected
                </q-item-label>
                <q-item-label
                  v-else-if="scan.reason === UnassignedReason.MultipleDetected"
                  class="text-amber"
                >
                  Multiple sheets detected
                </q-item-label>
                <q-item-label
                  v-else-if="scan.reason === UnassignedReason.AnotherTest"
                  class="test-amber"
                >
                  Detected sheet from another test
                </q-item-label>
                <q-item-label v-else-if="scan.reason === UnassignedReason.AssignmentRemoved">
                  Assignment removed
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-separator />
          <div class="row items-center">
            <q-item-label header>
              Assigned scans
            </q-item-label>
            <q-space />
            <q-btn
              :icon="filtersApplied ? 'mdi-filter' : 'mdi-filter-outline'"
              :color="filtersApplied ? 'primary' : undefined"
              round
              flat
              class="q-ma-sm"
            >
              <q-popup-proxy>
                <q-card>
                  <q-card-section class="q-pb-none">
                    <q-item-label>Other tests detected</q-item-label>
                    <q-btn-toggle
                      v-model="filters.otherTestsDetected"
                      toggle-color="primary"
                      class="text-no-wrap"
                      outline
                      :options="[
                        {label: 'Any', value: null},
                        {label: 'Detected', value: true},
                        {label: 'Not detected', value: false}
                      ]"
                    />
                  </q-card-section>
                  <q-card-section class="q-pb-none">
                    <q-item-label>With sheet reassigned</q-item-label>
                    <q-btn-toggle
                      v-model="filters.reassigned"
                      toggle-color="primary"
                      class="text-no-wrap"
                      outline
                      :options="[
                        {label: 'Any', value: null},
                        {label: 'Yes', value: true},
                        {label: 'No', value: false}
                      ]"
                    />
                  </q-card-section>
                  <q-card-actions align="right">
                    <q-btn
                      color="red"
                      outline
                      :disable="!filtersApplied"
                    >
                      Reset
                    </q-btn>
                  </q-card-actions>
                </q-card>
              </q-popup-proxy>
            </q-btn>
          </div>
          <q-item v-if="selectedAssignedScans === null">
            <q-item-section>
              <q-item-label overline>
                <q-skeleton
                  type="text"
                  width="65%"
                />
              </q-item-label>
              <q-item-label>
                <q-skeleton
                  type="text"
                />
              </q-item-label>
            </q-item-section>
          </q-item>
          <div
            v-else-if="selectedAssignedScans.length === 0"
            class="text-h6 text-center q-px-sm q-py-lg text-grey-8"
          >
            No scans match selected filters
          </div>
          <q-item
            v-for="scan in selectedAssignedScans"
            v-else
            :key="scan.shortId"
            :to="scan.to"
            class="scan-item"
          >
            <div class="active-border" />
            <q-item-section>
              <q-item-label overline>
                {{ scan.dateLabel }}
              </q-item-label>
              <template v-if="scan.sheet === null">
                <q-item-label>
                  <q-skeleton
                    type="text"
                    width="40%"
                  />
                </q-item-label>
                <q-item-label>
                  <q-skeleton
                    type="text"
                    width="60%"
                  />
                </q-item-label>
              </template>
              <template v-else>
                <q-item-label>
                  <code>{{ scan.sheet.phrase }}</code>
                  <span v-if="scan.sheet.page !== null">
                    (page {{ scan.sheet.page + 1 }})
                  </span>
                </q-item-label>
                <q-item-label
                  v-if="scan.sheet.student === ''"
                  class="no-student-label"
                >
                  No student
                </q-item-label>
                <q-item-label v-else>
                  {{ scan.sheet.student }}
                </q-item-label>
              </template>
            </q-item-section>
          </q-item>
        </q-scroll-area>
      </template>
    </q-splitter>
  </q-page>
</template>

<script lang="ts">
import {
  computed, defineComponent, reactive, PropType,
} from 'vue';
import { useStorage } from 'src/utils';
import { Scan, Sheet } from 'greatest-api-schemas';
import { useI18n } from 'vue-i18n';

enum UnassignedReason {
  NoDetected,
  MultipleDetected,
  AnotherTest,
  AssignmentRemoved,
}

interface SheetWithPage extends Sheet {
  page: number | null,
}

interface ScanItem {
  shortId: string,
  dateLabel: string,
  otherTestsDetected: boolean;
  reason: null | UnassignedReason;
  sheet: null | SheetWithPage;
  to: string;
  reassigned: boolean;
}

interface ScanItemAssigned extends ScanItem {
  reason: null;
}

interface ScanItemUnassigned extends ScanItem {
  reason: UnassignedReason;
  sheet: null;
}

interface Filters {
  otherTestsDetected: boolean | null;
  reassigned: boolean | null;
}

export default defineComponent({
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
    const i18n = useI18n();
    const indexedSheets = computed(() => {
      if (props.sheets === null) return null;
      const map = new Map<string, Sheet>();
      props.sheets.forEach((sheet) => {
        map.set(sheet.shortId, sheet);
      });
      return map;
    });
    const scanItems = computed<ScanItem[] | null>(() => {
      if (props.scans === null) return null;
      return props.scans.map((scan) => {
        const otherTestsDetected = scan.otherTests.length > 0;
        let reason: UnassignedReason | null;
        if (scan.sheet !== null) reason = null;
        else if (scan.detections.length === 1) reason = UnassignedReason.AssignmentRemoved;
        else if (scan.detections.length > 1) reason = UnassignedReason.MultipleDetected;
        else if (otherTestsDetected) reason = UnassignedReason.AnotherTest;
        else reason = UnassignedReason.NoDetected;
        let sheet: SheetWithPage | null = null;
        if (scan.sheet !== null && indexedSheets.value !== null) {
          const indexedSheet = indexedSheets.value.get(scan.sheet.shortId);
          if (indexedSheet !== undefined) {
            sheet = {
              ...indexedSheet,
              page: scan.sheet.page,
            };
          }
        }
        const detectedShortId = scan.detections.length === 1
          ? scan.detections[0].sheetShortId
          : null;
        const reassigned = detectedShortId !== (scan.sheet?.shortId ?? null);
        return {
          shortId: scan.shortId,
          dateLabel: new Date(scan.uploadedOn).toLocaleString(i18n.locale.value, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          otherTestsDetected,
          reason,
          sheet,
          to: `/tests/${props.testShortId}/scans/${scan.shortId}`,
          reassigned,
        };
      });
    });
    const filters = reactive<Filters>({
      otherTestsDetected: null,
      reassigned: null,
    });
    return {
      UnassignedReason,
      pageStyleFn: (offset: number) => ({ height: offset ? `calc(100vh - ${offset}px)` : '100vh' }),
      splitter: useStorage<number>('scans-splitter-position', () => 80),
      scanItems,
      unassignedScans: computed<ScanItemUnassigned[] | null>(
        () => {
          if (scanItems.value === null) return null;
          return scanItems.value.filter(
            (scan: ScanItem) => scan.reason !== null,
          ) as ScanItemUnassigned[];
        },
      ),
      filters,
      filtersApplied: computed(
        () => filters.otherTestsDetected !== null || filters.reassigned !== null,
      ),
      selectedAssignedScans: computed<ScanItemAssigned[] | null>(
        () => {
          if (scanItems.value === null) return null;
          let filtered = scanItems.value.filter(
            (scan) => scan.reason === null,
          ) as ScanItemAssigned[];
          if (filters.otherTestsDetected !== null) {
            filtered = filtered.filter(
              (scan) => scan.otherTestsDetected === filters.otherTestsDetected,
            );
          }
          if (filters.reassigned !== null) {
            filtered = filtered.filter(
              (scan) => scan.reassigned === filters.reassigned,
            );
          }
          return filtered;
        },
      ),
    };
  },
});
</script>

<style lang="scss">
.scans-tab {
  .no-student-label {
    opacity: 0.6;
  }

  .scan-item {
    .active-border {
      height: 100%;
      width: 3px;
      opacity: 0;
      background: $primary;
      position: absolute;
      top: 0;
      left: 0;
      transition: opacity 200ms;
      border-top-right-radius: 3px;
      border-bottom-right-radius: 3px;
    }

    &.q-router-link--active {
      .active-border {
        opacity: 1;
      }

      .q-item__label--overline {
        color: inherit;
      }
    }
  }
}
</style>
