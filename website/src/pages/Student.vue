<template>
  <q-page
    padding
    class="student-page"
  >
    <q-skeleton
      v-if="data === null"
      type="rect"
      height="100px"
    />
    <template v-else>
      <q-list
        padding
        class="q-mb-lg rounded-borders"
        bordered
      >
        <q-item>
          <q-item-section>
            <q-item-label overline>
              {{ $t('student.testName') }}
            </q-item-label>
            <q-item-label>{{ data.testName }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label overline>
              {{ $t('student.student') }}
            </q-item-label>
            <q-item-label
              v-if="data.student === ''"
              class="text-amber"
            >
              {{ $t('student.studentEmpty') }}
            </q-item-label>
            <q-item-label v-else>
              {{ data.student }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-card
        bordered
        flat
        class="q-mb-lg"
      >
        <q-card-section
          v-if="points.hasNotGraded"
          class="text-center text-h5 q-py-lg"
        >
          {{ $t('student.notGradedWarning') }}
        </q-card-section>
        <q-card-section
          v-else
          horizontal
        >
          <q-card-section class="flex-grow flex-no-basis text-center">
            <div class="text-overline">
              {{ $t('student.totalPoints.label') }}
            </div>
            <div class="text-h2">
              <b>{{ points.points }}</b>{{ $t('student.pointsSeparator') }}{{ points.maxPoints }}
            </div>
          </q-card-section>
          <q-separator vertical />
          <q-card-section class="flex-grow flex-no-basis text-center">
            <div class="text-overline">
              {{ $t('student.percent.label') }}
            </div>
            <div class="text-h2">
              <b>{{ points.percent ?? '-' }}</b>{{ $t('student.percent.symbol') }}
            </div>
          </q-card-section>
        </q-card-section>
      </q-card>
      <q-list
        bordered
        class="rounded-borders"
        separator
      >
        <q-item
          v-for="(question, questionIndex) in data.questions"
          :key="questionIndex"
        >
          <q-item-section>
            <q-item-label>
              {{ $t('student.questionNumber') }} <b>{{ questionIndex + 1 }}</b>
            </q-item-label>
          </q-item-section>
          <q-space />
          <q-item-section class="text-right">
            <q-item-label
              v-if="question.points === null"
              class="text-negative"
            >
              {{ $t('student.points.notGraded') }}
            </q-item-label>
            <q-item-label v-else>
              <b>{{ question.points }}</b>{{
                $t('student.pointsSeparator')
              }}{{ question.maxPoints }}
              {{ $t('student.points.label') }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </template>
    <div class="student-page-tip text-center q-mt-lg">
      <b>{{ $t('student.tip') }}</b> {{ $t('student.bookmarkTip') }}
    </div>
  </q-page>
</template>

<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import { useRoute } from 'vue-router';
import { GetStudentSheetReply } from 'greatest-api-schemas';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { getStudentSheet } from 'src/api';

export default defineComponent({
  beforeRouteEnter(to, from, next) {
    if (typeof to.query.phrase !== 'string') next('/');
    else next();
  },
  setup() {
    const route = useRoute();
    const quasar = useQuasar();
    const i18n = useI18n();

    const phrase = ref(route.query.phrase as string);
    watch(() => route.query.phrase, (value?) => {
      if (value === undefined) return;
      phrase.value = value as string;
    });

    const data = ref<GetStudentSheetReply | null>(null);
    watch(phrase, async (value) => {
      try {
        data.value = await getStudentSheet(value);
      } catch (error) {
        console.error(error);
        quasar.notify({
          type: 'negative',
          message: i18n.t('student.loadError'),
        });
      }
    }, { immediate: true });
    const points = computed<{
      points: number,
      maxPoints: number,
      percent: number | null,
      hasNotGraded: boolean,
    } | null>(() => {
      if (data.value === null) return null;
      let hasNotGraded = false;
      const total = data.value.questions.reduce<{
        points: number,
        maxPoints: number,
      }>((accumulator, question) => {
        if (question.points === null) hasNotGraded = true;
        return ({
          points: accumulator.points + (question.points ?? 0),
          maxPoints: accumulator.points + question.maxPoints,
        });
      }, {
        points: 0,
        maxPoints: 0,
      });
      return {
        ...total,
        percent: total.maxPoints === 0 ? null : Math.ceil((total.points / total.maxPoints) * 100),
        hasNotGraded,
      };
    });
    return {
      data,
      points,
    };
  },
});
</script>

<style lang="scss">
.student-page {
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
</style>
