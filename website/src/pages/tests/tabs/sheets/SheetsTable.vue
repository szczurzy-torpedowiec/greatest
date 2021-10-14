<template>
  <q-table
    :columns="columns"
    :rows="rows"
    row-key="shortId"
    :rows-per-page-options="[0]"
    hide-pagination
  >
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
          label="Add student"
          size="sm"
          color="primary"
          class="full-width"
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
  </q-table>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType,
} from 'vue';
import { Sheet } from 'greatest-api-schemas';
import SetStudentPopup from 'pages/tests/tabs/sheets/SetStudentPopup.vue';
import { uid } from 'quasar';
import { patchSheet } from 'src/api';
import { getTypeValidator } from 'src/utils';

export default defineComponent({
  components: { SetStudentPopup },
  props: {
    testShortId: {
      type: String,
      required: true,
    },
    sheets: {
      type: Array as PropType<Sheet[]>,
      required: true,
    },
  },
  emits: {
    addIgnoredRequestId: getTypeValidator<[requestId: string]>(),
    sheetStudentChanged: getTypeValidator<[sheetShortId: string, name: string]>(),
  },
  setup(props, { emit }) {
    return {
      columns: [
        {
          name: 'student',
          label: 'Student',
          field: 'student',
          sortable: true,
        },
        {
          name: 'phrase',
          label: 'Phrase',
          field: 'phrase',
          sortable: true,
        },
      ],
      rows: computed(() => props.sheets.map((sheet) => ({
        shortId: sheet.shortId,
        student: sheet.student,
        phrase: sheet.phrase,
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
