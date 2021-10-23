<template>
  <q-page padding>
    <q-card
      bordered
      flat
      class="q-mb-md sheets-copy-warning"
    >
      <q-card-section class="text-h4 q-pb-none">
        {{ $t('test.sheets.copyWarning.title') }}
      </q-card-section>
      <q-card-section>
        {{ $t('test.sheets.copyWarning.body') }}
      </q-card-section>
    </q-card>

    <sheets-table
      v-if="sheets !== null"
      :sheets="sheets"
      :scans="scans"
      :test-short-id="testShortId"
      :total-pages="totalPages"
      @add-ignored-request-id="onAddIgnoredRequestId"
      @sheet-student-changed="onSheetStudentChanged"
      @sheets-created="onSheetsCreated"
      @sheet-deleted="onSheetDeleted"
    />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Scan, Sheet } from 'greatest-api-schemas';
import { getTypeValidator } from 'src/utils';
import SheetsTable from 'components/test/sheets/SheetsTable.vue';

export default defineComponent({
  components: { SheetsTable },
  props: {
    sheets: {
      type: Array as PropType<Sheet[] | null>,
      default: null,
    },
    scans: {
      type: Array as PropType<Scan[] | null>,
      default: null,
    },
    testShortId: {
      type: String,
      required: true,
    },
    totalPages: {
      type: Number as PropType<number | null>,
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
    return {
      onAddIgnoredRequestId: (requestId: string) => {
        emit('addIgnoredRequestId', requestId);
      },
      onSheetStudentChanged: (sheetShortId: string, student: string) => {
        emit('sheetStudentChanged', sheetShortId, student);
      },
      onSheetsCreated: (sheets: Sheet[]) => {
        emit('sheetsCreated', sheets);
      },
      onSheetDeleted: (sheetShortId: string) => {
        emit('sheetDeleted', sheetShortId);
      },
    };
  },
});
</script>

<style lang="scss">
.sheets-copy-warning {
 border-color: $warning;
}
</style>
