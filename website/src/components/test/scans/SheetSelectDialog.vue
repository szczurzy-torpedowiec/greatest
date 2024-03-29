<template>
  <!-- TODO: Debug main thread blocking -->
  <q-dialog
    :model-value="modelValue"
    @update:model-value="onModelValueUpdate"
    @before-show="onBeforeShow"
  >
    <q-card class="sheet-select-dialog-card">
      <q-stepper
        :model-value="selectedSheet === null ? 'sheet' : 'page'"
        header-nav
        animated
        @update:model-value="onStepperChange"
      >
        <q-step
          name="sheet"
          :title="$t('test.scans.selectSheet.title')"
          class="step-no-padding"
          :done="selectedSheet !== null"
        >
          <q-card-section>
            <q-input
              v-model="searchValue"
              type="search"
              :label="$t('test.scans.selectSheet.search')"
              filled
              clearable
              icon="mdi-magnify"
              clear-icon="mdi-close"
              :hint="$t('test.scans.selectSheet.searchHint')"
              autofocus
            >
              <template #prepend>
                <q-icon name="mdi-magnify" />
              </template>
            </q-input>
          </q-card-section>
          <q-list>
            <template v-if="sheetItems === null">
              <q-item>
                <q-item-section>
                  <q-skeleton
                    type="text"
                    width="40%"
                  />
                  <q-skeleton
                    type="text"
                    width="30%"
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-skeleton
                    type="text"
                    width="50%"
                  />
                  <q-skeleton
                    type="text"
                    width="60%"
                  />
                </q-item-section>
              </q-item>
            </template>
            <div
              v-else-if="sheetItems.length === 0"
              class="text-h6 text-center q-px-sm q-py-lg text-grey-8"
            >
              {{ $t('test.scans.selectSheet.noMatching') }}
            </div>
            <q-item
              v-for="sheet in sheetItems"
              v-else
              :key="sheet.shortId"
              clickable
              @click="selectSheet(sheet)"
            >
              <q-item-section
                v-if="sheet.student === ''"
                class="text-grey-6 col-5"
              >
                {{ $t('test.scans.noStudent') }}
              </q-item-section>
              <q-item-section
                v-else
                class="col-5"
              >
                {{ sheet.student }}
              </q-item-section>
              <q-item-section>
                <code>{{ sheet.phrase }}</code>
              </q-item-section>
            </q-item>
          </q-list>
        </q-step>
        <q-step
          name="page"
          :title="$t('test.scans.selectSheet.pageTitle')"
          :header-nav="selectedSheet !== null"
        >
          <q-slider
            v-model="page"
            :min="0"
            :max="totalPages - 1"
            snap
            markers
            :label-value="$t('test.scans.selectSheet.pageSlider', { page: page + 1 })"
            label-always
          />
          <q-card-actions
            class="q-px-none"
            align="right"
          >
            <q-btn
              color="primary"
              outline
              @click="wrapSubmit(selectedSheetId, null)"
            >
              {{ $t('test.scans.selectSheet.submitWithoutPage') }}
            </q-btn>
            <q-btn
              color="primary"
              @click="wrapSubmit(selectedSheetId, page)"
            >
              {{ $t('test.scans.selectSheet.submitWithPage', { page: page + 1 }) }}
            </q-btn>
          </q-card-actions>
        </q-step>
      </q-stepper>
      <q-inner-loading
        :showing="loading"
        color="primary"
      />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, ref,
} from 'vue';
import { Sheet } from 'greatest-api-schemas';
import { getTypeValidator } from 'src/utils';

export default defineComponent({
  props: {
    sheets: {
      type: Array as PropType<Sheet[] | null>,
      default: null,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    submit: {
      type: Function as PropType<(
        sheetShortId: string,
        selectedPage: number | null,
      ) => Promise<void>>,
      required: true,
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'update:modelValue': getTypeValidator<[value: boolean]>(),
  },
  setup(props, { emit }) {
    const searchValue = ref('');
    const selectedSheetId = ref<string | null>(null);
    const page = ref(0);
    const loading = ref(false);
    const wrapSubmit = async (sheetShortId: string, selectedPage: number | null) => {
      loading.value = true;
      await props.submit(sheetShortId, selectedPage);
      loading.value = false;
    };
    return {
      loading,
      searchValue,
      selectedSheetId,
      selectedSheet: computed(() => {
        if (props.sheets === null || selectedSheetId.value === null) return null;
        return props.sheets.find((sheet) => sheet.shortId === selectedSheetId.value) ?? null;
      }),
      page,
      sheetItems: computed(() => {
        if (props.sheets === null) return null;
        const search = searchValue.value.trim().toLowerCase();
        if (search === '') return props.sheets;
        return props.sheets.filter((sheet) => (
          sheet.phrase.toLowerCase().includes(search)
          || sheet.student.toLowerCase().includes(search)
          || sheet.shortId === search));
      }),
      selectSheet: (sheet: Sheet) => {
        page.value = 0;
        selectedSheetId.value = sheet.shortId;
      },
      wrapSubmit,
      onBeforeShow: () => {
        selectedSheetId.value = null;
      },
      onStepperChange: (step: string) => {
        if (step === 'sheet') selectedSheetId.value = null;
      },
      onModelValueUpdate: (value: boolean) => {
        emit('update:modelValue', value);
      },
    };
  },
});
</script>

<style lang="scss">
  .sheet-select-dialog-card {
    min-width: 350px;
  }
</style>
