<template>
  <q-item-label header>
    {{ $t('test.scans.unassignedScans') }}
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
    {{ $t('test.scans.allAssigned') }}
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
          {{ $t('test.scans.reason.noDetected') }}
        </q-item-label>
        <q-item-label
          v-else-if="scan.reason === UnassignedReason.MultipleDetected"
          class="text-amber"
        >
          {{ $t('test.scans.reason.multipleDetected') }}
        </q-item-label>
        <q-item-label
          v-else-if="scan.reason === UnassignedReason.AnotherTest"
          class="test-amber"
        >
          {{ $t('test.scans.reason.anotherTest') }}
        </q-item-label>
        <q-item-label v-else-if="scan.reason === UnassignedReason.AssignmentRemoved">
          {{ $t('test.scans.reason.assignmentRemoved') }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
  <q-separator />
  <div class="row items-center">
    <q-item-label header>
      {{ $t('test.scans.assignedScans') }}
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
            <q-item-label class="q-mb-sm">
              {{ $t('test.scans.filters.otherTests.label') }}
            </q-item-label>
            <q-btn-toggle
              v-model="filters.otherTestsDetected"
              toggle-color="primary"
              class="text-no-wrap"
              outline
              :options="[
                {label: $t('test.scans.filters.otherTests.any'), value: null},
                {label: $t('test.scans.filters.otherTests.yes'), value: true},
                {label: $t('test.scans.filters.otherTests.no'), value: false}
              ]"
            />
          </q-card-section>
          <q-card-section class="q-pb-none">
            <q-item-label class="q-mb-sm">
              {{ $t('test.scans.filters.reassigned.label') }}
            </q-item-label>
            <q-btn-toggle
              v-model="filters.reassigned"
              toggle-color="primary"
              class="text-no-wrap"
              outline
              spread
              :options="[
                {label: $t('test.scans.filters.reassigned.any'), value: null},
                {label: $t('test.scans.filters.reassigned.yes'), value: true},
                {label: $t('test.scans.filters.reassigned.no'), value: false}
              ]"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              color="red"
              outline
              :disable="!filtersApplied"
              @click="resetFilters"
            >
              {{ $t('common.reset') }}
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
    {{ $t('test.scans.filters.noScans') }}
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
          <span
            v-if="scan.sheet.page !== null"
            class="q-ml-xs"
          >
            {{ $t('test.scans.page', { page: scan.sheet.page + 1 }) }}
          </span>
        </q-item-label>
        <q-item-label
          v-if="scan.sheet.student === ''"
          class="no-student-label"
        >
          {{ $t('test.scans.noStudent') }}
        </q-item-label>
        <q-item-label v-else>
          {{ scan.sheet.student }}
        </q-item-label>
      </template>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, reactive,
} from 'vue';
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
          to: `/teacher/tests/${props.testShortId}/scans/${scan.shortId}`,
          reassigned,
        };
      });
    });

    const filters = reactive<Filters>({
      otherTestsDetected: null,
      reassigned: null,
    });

    return {
      filters,
      filtersApplied: computed(
        () => filters.otherTestsDetected !== null || filters.reassigned !== null,
      ),
      resetFilters: () => {
        filters.otherTestsDetected = null;
        filters.reassigned = null;
      },
      UnassignedReason,
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
      scanItems,
      unassignedScans: computed<ScanItemUnassigned[] | null>(
        () => {
          if (scanItems.value === null) return null;
          return scanItems.value.filter(
            (scan: ScanItem) => scan.reason !== null,
          ) as ScanItemUnassigned[];
        },
      ),
    };
  },
});
</script>

<style lang="scss">
.scan-list {
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
