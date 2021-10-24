<template>
  <div :class="fullScreen ? 'q-pa-sm' : 'q-pa-md'">
    <q-btn
      v-if="fullScreen"
      flat
      round
      icon="mdi-arrow-left"
      class="q-mb-sm"
      :to="`/teacher/tests/${testShortId}/scans`"
    />
    <q-card
      bordered
      flat
    >
      <div class="row items-center no-wrap">
        <div class="flex-grow">
          <q-item-label header>
            {{
              assignedSheet === null
                ? $t('test.scans.hasAssigned.no')
                : $t('test.scans.hasAssigned.yes')
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
      </div>
      <template v-if="detectedSheets !== null && detectedSheets.length > 0">
        <q-separator />
        <q-item-label header>
          {{ $t('test.scans.detectedSheets') }}
        </q-item-label>
        <q-list>
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
      </template>
    </q-card>
    <sheet-select-dialog
      v-model="showSheetSelect"
      :sheets="sheets"
      :submit="sheetSelectSubmit"
    />
  </div>
  <q-separator />
  <div class="image-contain flex-grow bg-dark text-white scan-details__image">
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
import { uid, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {
    SheetSelectDialog,
  },
  props: {
    fullScreen: {
      type: Boolean,
    },
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
    const i18n = useI18n();
    const quasar = useQuasar();

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
          quasar.notify({
            type: 'negative',
            message: i18n.t('test.scans.assignSheetFailed'),
          });
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
          quasar.notify({
            type: 'negative',
            message: i18n.t('test.scans.removeSheetAssignmentFailed'),
          });
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

<style lang="scss">
.scan-details__image {
  min-height: 200px;
}
</style>
