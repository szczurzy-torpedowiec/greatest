<template>
  <q-table
    v-model:selected="selected"
    :columns="columns"
    :rows="rows"
    row-key="shortId"
    :rows-per-page-options="[0]"
    hide-pagination
    flat
    bordered
    selection="multiple"
  >
    <template #top>
      <div class="row items-center full-width">
        <span>
          <q-btn
            color="primary"
            icon="mdi-printer"
            :label="$t('test.sheets.print')"
            :disable="selected.length === 0"
          />
          <q-tooltip v-if="selected.length === 0">
            {{ $t('test.sheets.noSheetsSelected') }}
          </q-tooltip>
        </span>
        <span class="q-ml-sm">
          <q-btn
            outline
            color="negative"
            icon="mdi-delete"
            :label="$t('test.sheets.delete')"
            :disable="selected.length === 0 || selectedHasScanned"
          >
            <delete-confirm-menu :submit="deleteSheets" />
          </q-btn>
          <q-tooltip v-if="selected.length === 0">
            {{ $t('test.sheets.noSheetsSelected') }}
          </q-tooltip>
          <q-tooltip v-else-if="selectedHasScanned">
            {{ $t('test.sheets.cannotDeleteScannedSheets') }}
          </q-tooltip>
        </span>
        <q-space />
        <q-btn
          color="primary"
          outline
          icon="mdi-plus"
          :label="$t('test.sheets.createSheetsButton')"
        >
          <create-sheets-popup :submit="createSheetsSubmit" />
        </q-btn>
      </div>
    </template>
    <template
      #body-cell-student="cell"
    >
      <q-td
        v-if="cell.value === ''"
        :props="cell"
      >
        <q-btn
          icon="mdi-plus"
          outline
          :label="$t('test.sheets.addStudent')"
          size="sm"
          color="primary"
          class="full-width btn-no-wrap"
        >
          <set-student-popup
            name=""
            :submit="cell.row.setStudentSubmit"
          />
        </q-btn>
      </q-td>
      <q-td
        v-else
        :props="cell"
      >
        {{ cell.value }}
        <q-btn
          icon="mdi-pencil"
          outline
          round
          size="sm"
          color="primary"
          class="q-ml-sm"
        >
          <set-student-popup
            :name="cell.value"
            :submit="cell.row.setStudentSubmit"
          />
        </q-btn>
      </q-td>
    </template>
    <template
      #body-cell-phrase="cell"
    >
      <q-td :props="cell">
        <code>{{ cell.value }}</code>
      </q-td>
    </template>
    <template
      #body-cell-pages="cell"
    >
      <q-td :props="cell">
        <q-skeleton v-if="cell.value === null" />
        <template v-else>
          <div class="row items-center no-wrap">
            <div v-if="cell.value.allScanned">
              <q-chip
                color="positive"
                text-color="white"
                icon="mdi-check-all"
                :label="$t('test.sheets.allPagesScanned')"
              />
            </div>
            <div v-else>
              <q-chip
                v-for="(pageScans, pageIndex) in cell.value.pageScans"
                :key="pageIndex"
                :icon="pageScans === 0 ? 'mdi-close' : 'mdi-check'"
                :color="pageScans === 0 ? 'negative' : (pageScans === 1 ? 'positive' : 'secondary')"
                text-color="white"
              >
                {{ pageIndex + 1 }}
                <q-tooltip>
                  {{ $tc(
                    'test.sheets.pageTooltip',
                    pageScans,
                    {times: pageScans, page: pageIndex + 1}
                  ) }}
                </q-tooltip>
              </q-chip>
            </div>
            <q-space />
            <div
              v-if="cell.value.additional > 0"
              class="sheets-table-additional-page-count q-pa-xs"
            >
              {{ $tc('test.sheets.scansWithoutPage', cell.value.additional) }}
              <q-tooltip>
                <span class="text-no-wrap">
                  {{ $tc('test.sheets.scansWithoutPageTooltip', cell.value.additional) }}
                </span>
              </q-tooltip>
            </div>
          </div>
        </template>
      </q-td>
    </template>
  </q-table>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, ref,
} from 'vue';
import SetStudentPopup from 'components/test/sheets/SetStudentPopup.vue';
import { uid, useQuasar } from 'quasar';
import { createRandomSheets, deleteSheet, patchSheet } from 'src/api';
import { getTypeValidator, DefaultsMap } from 'src/utils';
import { useI18n } from 'vue-i18n';
import CreateSheetsPopup from 'components/test/sheets/CreateSheetsPopup.vue';
import { Scan, Sheet } from 'greatest-api-schemas';
import DeleteConfirmMenu from 'components/DeleteConfirmMenu.vue';

interface ScanWithSheet extends Scan {
  sheet: NonNullable<Scan['sheet']>;
}

interface Pages {
  pageScans: number[];
  allScanned: boolean,
  additional: number;
  total: number;
}

interface Row {
  shortId: string;
  student: string;
  phrase: string;
  pages: Pages | null;
  setStudentSubmit: (student: string) => Promise<void>;
}

function mapPages(
  sheet: Sheet,
  sheetScans: ScanWithSheet[] | undefined,
  totalPages: number | null,
): Pages | null {
  if (sheetScans === undefined || totalPages === null) return null;
  const pageScans = new Array(totalPages).fill(0);
  let additional = 0;
  sheetScans.forEach((scan) => {
    if (scan.sheet.page === null) additional += 1;
    else pageScans[scan.sheet.page] += 1;
  });
  return {
    pageScans,
    allScanned: pageScans.every((x) => x > 0),
    additional,
    total: sheetScans.length,
  };
}

export default defineComponent({
  components: { DeleteConfirmMenu, CreateSheetsPopup, SetStudentPopup },
  props: {
    testShortId: {
      type: String,
      required: true,
    },
    totalPages: {
      type: Number as PropType<number | null>,
      default: null,
    },
    sheets: {
      type: Array as PropType<Sheet[]>,
      required: true,
    },
    scans: {
      type: Array as PropType<Scan[] | null>,
      default: null,
    },
  },
  emits: {
    addIgnoredRequestId: getTypeValidator<[requestId: string]>(),
    sheetStudentChanged: getTypeValidator<[sheetShortId: string, name: string]>(),
    sheetsCreated: getTypeValidator<[sheets: Sheet[]]>(),
    sheetDeleted: getTypeValidator<[sheetShortId: string]>(),
  },
  setup(props, { emit }) {
    const i18n = useI18n();
    const quasar = useQuasar();

    const scansBySheetId = computed(() => {
      if (props.scans === null) return null;
      const map = new DefaultsMap<string, ScanWithSheet[]>(() => []);
      props.scans.forEach((scan) => {
        if (scan.sheet !== null) {
          map.get(scan.sheet.shortId).push({
            ...scan,
            sheet: scan.sheet,
          });
        }
      });
      return map;
    });
    const selected = ref<Row[]>([]);
    const selectedHasScanned = computed(() => selected.value.some(
      (sheet) => sheet.pages !== null && sheet.pages?.total > 0,
    ));
    const deleteSheetAndHandle = async (sheetShortId: string) => {
      try {
        const requestId = uid();
        emit('addIgnoredRequestId', requestId);
        await deleteSheet(props.testShortId, sheetShortId, {
          requestId,
        });
        emit('sheetDeleted', sheetShortId);
      } catch (error) {
        console.error(error);
        quasar.notify({
          type: 'negative',
          message: i18n.t('test.sheets.deleteSheetError'),
        });
      }
    };
    return {
      selected,
      selectedHasScanned,
      createSheetsSubmit: async (count: number) => {
        const requestId = uid();
        emit('addIgnoredRequestId', requestId);
        const { newSheets } = await createRandomSheets(props.testShortId, {
          count,
          requestId,
        });
        // TODO: Select new sheets
        emit('sheetsCreated', newSheets);
      },
      deleteSheets: async () => {
        await Promise.all(selected.value.map(
          (sheet) => deleteSheetAndHandle(sheet.shortId),
        ));
        selected.value = [];
      },
      columns: computed(() => [
        {
          name: 'student',
          label: i18n.t('test.sheets.headers.student'),
          field: 'student',
          sortable: true,
        },
        {
          name: 'phrase',
          label: i18n.t('test.sheets.headers.phrase'),
          field: 'phrase',
          sortable: true,
        },
        {
          name: 'pages',
          label: i18n.t('test.sheets.headers.pages'),
          field: 'pages',
        },
      ]),
      rows: computed<Row[]>(() => props.sheets.map((sheet) => ({
        shortId: sheet.shortId,
        student: sheet.student,
        phrase: sheet.phrase,
        pages: mapPages(sheet, scansBySheetId.value?.get(sheet.shortId), props.totalPages),
        setStudentSubmit: async (student: string) => {
          const requestId = uid();
          emit('addIgnoredRequestId', requestId);
          await patchSheet(props.testShortId, sheet.shortId, {
            student,
            requestId,
          });
          emit('sheetStudentChanged', sheet.shortId, student);
        },
      }))),
    };
  },
});
</script>

<style lang="scss">
.sheets-table-additional-page-count {
  border-radius: 2px;
  transition: background-color 150ms;

  &:hover {
    background: #0001;
  }
}
</style>
