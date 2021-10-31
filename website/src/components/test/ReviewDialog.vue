<template>
  <q-card>
    <q-toolbar class="bg-primary text-white">
      <q-btn
        flat
        round
        dense
        icon="mdi-arrow-left"
        class="q-mr-sm"
        :to="`/teacher/tests/${testId}/sheets/`"
      />
    </q-toolbar>
    <div
      style="height: calc(100vh - 50px);"
    >
      <q-splitter
        v-model="splitter"
        class="full-height"
        :limits="[20, 80]"
      >
        <template #before>
          <div
            v-for="scan in scans"
            :key="scan"
            class="image-contain flex-grow bg-dark text-white scan-details__image full-height row"
          >
            <img
              :alt="$t('test.scans.imageAlt')"
              :src="getScanImageUrl($route.params.testShortId.toString(), scan.shortId)"
            >
          </div>
          <q-page
            v-if="!scans[0]"
            class="items-center justify-center column"
          >
            {{ $t('test.sheets.noScans') }}
          </q-page>
        </template>
        <template #after>
          <q-scroll-area style="height: 100%">
            <div class="q-ma-md q-gutter-y-md q-mb-xl">
              <q-card
                v-for="(question, index) in questions"
                :key="index"
                flat
                bordered
                :style="question.points === null
                  ? 'border-color: Orange'
                  : 'border-color: rgba(0, 0, 0, 0.12)'
                "
              >
                <q-card-section>
                  {{ index }}. {{ question.usedVariant.content }}
                  <div
                    v-if="question.usedVariant.correctAnswer"
                    class="text-green text-subtitle2"
                  >
                    {{ $t('common.correctAnswer') }}: {{ question.usedVariant.correctAnswer }}
                  </div>
                </q-card-section>
                <q-card-section class="row justify-end">
                  <q-input
                    v-model.number="question.points"
                    debounce="1000"
                    type="number"
                    :label="$t('common.points')"
                    dense
                    filled
                    class="q-mx-sm"
                    min="0"
                    :max="question.maxPoints"
                    clearable
                    @blur="pointsUpdate(index, question.points)"
                    @clear="pointsUpdate(index, null)"
                  >
                    <template #after>
                      /{{ question.maxPoints }}
                    </template>
                  </q-input>
                </q-card-section>
              </q-card>
            </div>
          </q-scroll-area>
          <q-card
            square
            class="bg-primary text-white"
            style="position: absolute; bottom: 0; width: 100%"
          >
            <q-card-section class="text-h6 row">
              <div class="col">
                {{ $t('common.points') }}: {{ result.points }}/{{ result.maxPoints }}
              </div>
              {{ result.percentage }}%
            </q-card-section>
          </q-card>
        </template>
      </q-splitter>
    </div>
  </q-card>
</template>

<script lang="ts">
import {
  defineComponent, PropType, onMounted, ref, computed,
} from 'vue';
import { useStorage } from 'src/utils';
import { ScanWithSheet } from 'components/test/sheets/SheetsTable.vue';
import {
  getScanImageUrl, getSheet, getTest, patchSheet,
} from 'src/api';
import { GetTestReply } from 'greatest-api-schemas';
import { uid } from 'quasar';

type SheetQuestion = GetTestReply['pages'][0][0] & {
  usedVariant: {
    content: string
  } | {
    content: string,
    correctAnswer: string,
    incorrectAnswers: string[]
  },
  points: number | null,
};

export default defineComponent({
  name: 'ReviewDialog',
  props: {
    scans: {
      type: Array as PropType<ScanWithSheet[]>,
      required: true,
    },
    sheetId: {
      type: String,
      required: true,
    },
    testId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const questions = ref<SheetQuestion[]>([]);
    const result = computed(() => {
      const values = {
        points: 0,
        maxPoints: 0,
        percentage: 0,
      };
      questions.value.forEach((question) => {
        values.points += question.points ? question.points : 0;
        values.maxPoints += question.maxPoints;
      });
      values.percentage = Math.round((values.points / values.maxPoints) * 100);
      return values;
    });

    async function getQuestions() {
      const sheet = await getSheet(props.testId, props.sheetId);
      const test = await getTest(props.testId);
      questions.value = test.pages.flat(1).map((x, i) => ({
        ...x,
        usedVariant: x.variants[sheet.questions[i].variant],
        points: sheet.questions[i].points,
      }));
    }

    onMounted(getQuestions);

    async function pointsUpdate(index: number, questionPoints: number | null) {
      await patchSheet(props.testId, props.sheetId, {
        questions: [{
          index,
          points: questionPoints,
        }],
        requestId: uid(),
      });
    }

    return {
      getScanImageUrl,
      pointsUpdate,
      questions,
      splitter: useStorage<number>('review-splitter-position', () => 80),
      result,
    };
  },
});
</script>
