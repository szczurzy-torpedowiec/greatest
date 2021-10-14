<template>
  <q-page padding>
    <sheets-table
      v-if="sheets !== null"
      :sheets="sheets"
      :scans="scans"
      :test-short-id="testShortId"
      @add-ignored-request-id="onAddIgnoredRequestId"
      @sheet-student-changed="onSheetStudentChanged"
    />
  </q-page>
</template>

<script lang="ts">
import SheetsTable from 'pages/tests/tabs/sheets/SheetsTable.vue';
import { defineComponent, PropType } from 'vue';
import { Scan, Sheet } from 'greatest-api-schemas';
import { getTypeValidator } from 'src/utils';

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
  },
  emits: {
    addIgnoredRequestId: getTypeValidator<[requestId: string]>(),
    sheetStudentChanged: getTypeValidator<[sheetShortId: string, name: string]>(),
  },
  setup(props, { emit }) {
    return {
      onAddIgnoredRequestId: (requestId: string) => {
        emit('addIgnoredRequestId', requestId);
      },
      onSheetStudentChanged: (sheetShortId: string, student: string) => {
        emit('sheetStudentChanged', sheetShortId, student);
      },
    };
  },
});
</script>
