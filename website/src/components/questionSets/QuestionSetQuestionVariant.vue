<template>
  <q-card
    bordered
    flat
    class="q-my-lg"
    :style="edited ? 'border-color: orange': 'border-color: rgba(0, 0, 0, 0.12)'"
  >
    <q-card-section>
      <div class="row">
        <q-input
          v-model="values.content"
          class="col"
          :label="$t('common.question')"
        />
        <q-btn
          flat
          color="red"
          icon="delete"
        >
          <delete-confirm-menu :submit="deleteVariant" />
        </q-btn>
      </div>

      <div
        v-if="values.type==='quiz'"
        class="row justify-evenly"
      >
        <q-input
          v-model="values.correctAnswer"
          outlined
          color="green"
          class="q-mt-md q-mx-sm col-5"
          :label="$t('common.correctAnswer')"
        >
          <template #prepend>
            <q-icon
              name="check"
              color="green"
            />
          </template>
        </q-input>
        <q-input
          v-for="(_, index) in values.incorrectAnswers"
          :key="index"
          v-model="values.incorrectAnswers[index]"
          outlined
          color="red"
          class="q-mt-md q-mx-sm col-5"
          :label="$t('common.incorrectAnswer')"
          @blur="refreshIncorrect"
          @keydown.enter="refreshIncorrect"
        >
          <template #prepend>
            <q-icon
              name="clear"
              color="red"
            />
          </template>
        </q-input>
      </div>
    </q-card-section>
    <q-card-actions v-if="edited">
      <q-space />
      <q-btn
        color="orange"
        :label="$t('common.save')"
        @click="saveVariant"
      />
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import {
  defineComponent, PropType, ref, watch,
} from 'vue';

import { useRoute } from 'vue-router';

import {
  QuestionVariantOpen,
  QuestionVariantQuiz,
  PatchQuestionVariantBody,
} from 'greatest-api-schemas';

import { patchQuestionVariant, deleteQuestionVariant } from 'src/api';
import DeleteConfirmMenu from 'components/DeleteConfirmMenu.vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

export interface QuestionVariantOpenProp extends QuestionVariantOpen {
  type: 'open';
}
export interface QuestionVariantQuizProp extends QuestionVariantQuiz {
  type: 'quiz';
}
export type QuestionVariantProp = QuestionVariantOpenProp | QuestionVariantQuizProp;

export default defineComponent({
  name: 'QuestionSetQuestionVariant',
  components: {
    DeleteConfirmMenu,
  },
  props: {
    questionId: {
      type: String,
      required: true,
    },
    variant: {
      type: Object as PropType<QuestionVariantProp>,
      required: true,
    },
  },
  emits: ['updateQuestions'],
  setup(props, { emit }) {
    const quasar = useQuasar();
    const i18n = useI18n();
    const route = useRoute();

    const values = ref<QuestionVariantProp>({ ...props.variant });
    const edited = ref<boolean>(false);

    async function saveVariant() {
      const body: PatchQuestionVariantBody = values.value.type === 'quiz'
        ? {
          type: 'quiz',
          content: values.value.content,
          correctAnswer: values.value.correctAnswer,
          incorrectAnswers: values.value.incorrectAnswers.filter(Boolean),
        } : {
          type: 'open',
          content: values.value.content,
        };
      await patchQuestionVariant(
        route.params.id as string,
        props.questionId,
        props.variant.shortId,
        body,
      );

      edited.value = false;
      emit('updateQuestions');
    }

    function refreshIncorrect() {
      if (values.value.type === 'quiz') {
        values.value.incorrectAnswers = values.value.incorrectAnswers.filter(Boolean);
        values.value.incorrectAnswers.push('');
      }
    }

    refreshIncorrect();

    watch(values, () => {
      if (values.value.type === 'quiz') {
        const checkValues = {
          ...values.value,
          incorrectAnswers: values.value.incorrectAnswers.slice(0, -1),
        };
        edited.value = props.variant !== checkValues;
      } else edited.value = props.variant !== values.value;
    }, { deep: true });

    async function deleteVariant() {
      try {
        await deleteQuestionVariant(
          route.params.id as string,
          props.questionId,
          props.variant.shortId,
        );
        emit('updateQuestions');
      } catch (error) {
        console.error(error);
        quasar.notify({
          type: 'negative',
          message: i18n.t('questionSets.deleteQuestionVariantError'),
        });
      }
    }

    return {
      values,
      edited,
      saveVariant,
      refreshIncorrect,
      deleteVariant,
    };
  },
});
</script>

<style scoped>

</style>
