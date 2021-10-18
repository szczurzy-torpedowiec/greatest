<template>
  <div class="q-pa-md">
    <q-card
      bordered
      flat
      class="row items-center no-wrap"
    >
      <div class="flex-grow">
        <q-item-label header>
          {{
            assignedSheet === null
              ? $t('test.scans.hasAssigned.yes')
              : $t('test.scans.hasAssigned.no')
          }}
        </q-item-label>
      </div>
      <q-btn
        icon="mdi-delete"
        flat
        round
        color="negative"
        :loading="removeAssignmentLoading"
        :disable="assignedSheet === null"
        @click="removeAssignment"
      >
        <q-tooltip>{{ $t('test.scans.removeAssignment') }}</q-tooltip>
      </q-btn>
      <q-btn
        color="primary"
        class="q-ma-sm"
        @click="showSheetSelect = true"
      >
        {{ $t('common.select') }}
      </q-btn>
    </q-card>

    <q-list
      v-if="detectedSheets !== null && detectedSheets.length > 0"
      bordered
      class="q-mt-md rounded-borders"
    >
      <q-item-label header>
        {{ $t('test.scans.detectedSheets') }}
      </q-item-label>
      <q-item
        v-for="detection in detectedSheets"
        :key="detection.sheetShortId"
        clickable
        :active="assignedSheet?.shortId === detection.sheetShortId"
        @click="sheetSelectSubmit(detection.sheetShortId, detection.page)"
      >
        <q-item-section>
          <q-item-label>
            <code>{{ detection.phrase }}</code>
            <span
              v-if="scan.sheet.page !== null"
              class="q-ml-xs"
            >
              {{ $t('test.scans.page', { page: detection.page + 1 }) }}
            </span>
          </q-item-label>
          <q-item-label
            v-if="detection.student === ''"
            class="text-grey-6"
          >
            {{ $t('test.scans.noStudent') }}
          </q-item-label>
          <q-item-label v-else>
            {{ detection.student }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <sheet-select-dialog
      v-model="showSheetSelect"
      :sheets="sheets"
      :submit="sheetSelectSubmit"
    />
  </div>
  <q-separator />
  <div class="image-contain flex-grow bg-dark text-white">
    <img
      :alt="$t('test.scans.imageAlt')"
      :src="scan.scanImageUrl"
    >
  </div>
</template>

<script lang="ts">
import { patchScan } from 'src/api';
import {
  computed, defineComponent, PropType, ref,
} from 'vue';
import SheetSelectDialog from 'components/test/scans/SheetSelectDialog.vue';
import { Scan, Sheet } from 'greatest-api-schemas';
import { uid } from 'quasar';

export default defineComponent({
  components: {
    SheetSelectDialog,
  },
  props: {
    testShortId: {
      type: String,
      required: true,
    },
    sheets: {
      type: Array as PropType<Sheet[] | null>,
      default: null,
    },
    scan: {
      type: Object as PropType<Scan & {scanImageUrl: string}>,
      required: true,
    },
  },
  setup(props) {
    const showSheetSelect = ref(false);
    const removeAssignmentLoading = ref(false);
    return {
      sheetSelectSubmit: async (sheetShortId: string, page: number | null) => {
        try {
          const requestId = uid();
          await patchScan(props.testShortId, props.scan.shortId, {
            sheet: {
              shortId: sheetShortId,
              page,
            },
            requestId,
          });
          showSheetSelect.value = false;
        } catch (error) {
          console.error(error);
          // TODO: Notify
        }
      },
      showSheetSelect,
      removeAssignmentLoading,
      removeAssignment: async () => {
        removeAssignmentLoading.value = true;
        try {
          const requestId = uid();
          await patchScan(props.testShortId, props.scan.shortId, {
            sheet: null,
            requestId,
          });
          showSheetSelect.value = false;
        } catch (error) {
          console.error(error);
          // TODO: Notify
        }
        removeAssignmentLoading.value = false;
      },
      assignedSheet: computed(() => {
        const scanSheet = props.scan.sheet;
        if (props.sheets === null || scanSheet === null) return null;
        const assignedSheet = props.sheets.find(
          (sheet) => sheet.shortId === scanSheet.shortId,
        );
        if (assignedSheet === undefined) return null;
        return {
          ...assignedSheet,
          page: scanSheet.page,
        };
      }),
      detectedSheets: computed(() => {
        const { sheets } = props;
        if (sheets === null) return null;
        return props.scan.detections.map((detection) => {
          const sheet = sheets.find((item) => item.shortId === detection.sheetShortId);
          if (sheet === undefined) return null;
          return {
            ...detection,
            phrase: sheet.phrase,
            student: sheet.student,
          };
        }).filter((x) => x !== null);
      }),
    };
  },
});
</script>
