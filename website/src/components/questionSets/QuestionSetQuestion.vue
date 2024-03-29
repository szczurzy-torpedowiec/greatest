<template>
  <q-card class="q-mb-md">
    <q-card-section
      horizontal
    >
      <q-card-section class="col">
        <div
          v-if="question.variants.length === 0 || question.variants[0].content === ''"
          class="text-h6 text-orange"
        >
          {{ $t('questionSets.noVariants') }}
        </div>
        <div
          v-else
          class="text-h6"
        >
          {{ question.variants[0].content }}
        </div>
        <q-btn
          flat
          :label="$t('common.variants')"
          :icon="variantsVisible ? 'expand_less' : 'expand_more'"
          @click="variantsVisible = !variantsVisible"
        />
      </q-card-section>
      <q-card-actions>
        <q-input
          v-model.number="maxPoints"
          debounce="1000"
          type="number"
          :label="$t('common.points')"
          dense
          filled
          class="q-mx-sm"
          min="0"
          max="50"
        />
        <q-btn
          flat
          color="red"
          icon="delete"
        >
          <delete-confirm-menu :submit="removeQuestion" />
        </q-btn>
      </q-card-actions>
    </q-card-section>
    <q-card-section
      v-if="variantsVisible"
    >
      <question-set-question-variant
        v-for="variant in questionVariantsWithTypes"
        :key="variant.shortId"
        :variant="variant"
        :question-id="question.shortId"
        @update-questions="$emit('updateQuestions')"
      />
      <q-btn
        color="primary"
        :label="$t('questionSets.addVariant')"
        icon="edit"
        class="full-width q-ma-md"
        @click="addVariant"
      />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  ref,
  watch,
  computed,
} from 'vue';
import { QuestionWithIds } from 'greatest-api-schemas';
import { patchQuestion, createQuestionVariant, deleteQuestion } from 'src/api';
import { useRoute } from 'vue-router';
import QuestionSetQuestionVariant, { QuestionVariantProp } from 'components/questionSets/QuestionSetQuestionVariant.vue';
import DeleteConfirmMenu from 'components/DeleteConfirmMenu.vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

interface VariantEditQuiz {
  content: string,
  correctAnswer: string,
  incorrectAnswers: string[],
}

interface VariantEditOpen {
  content: string,
}

export default defineComponent({
  name: 'QuestionSetQuestion',
  components: {
    QuestionSetQuestionVariant,
    DeleteConfirmMenu,
  },
  props: {
    question: {
      type: Object as PropType<QuestionWithIds>,
      required: true,
    },
  },
  emits: ['updateQuestions'],
  setup(props, { emit }) {
    const quasar = useQuasar();
    const i18n = useI18n();
    const route = useRoute();

    const variantsVisible = ref(false);
    const variantCreatorVisible = ref(false);
    const variantsValue = [...props.question.variants];
    const variantsEdit = ref<(VariantEditQuiz|VariantEditOpen)[]>(variantsValue);

    const maxPoints = ref<number>(props.question.maxPoints);

    const questionVariantsWithTypes = computed<QuestionVariantProp[]>(() => {
      switch (props.question.type) {
        case 'open': return props.question.variants.map((variant) => ({
          ...variant,
          type: 'open',
        }));
        case 'quiz': return props.question.variants.map((variant) => ({
          ...variant,
          type: 'quiz',
        }));
      }
    });

    async function addVariant() {
      try {
        await createQuestionVariant(
          route.params.id as string,
          props.question.shortId,
          props.question.type === 'quiz'
            ? {
              type: props.question.type,
              content: '',
              correctAnswer: '',
              incorrectAnswers: [],
            }
            : { type: props.question.type, content: '' },
        );
        emit('updateQuestions');
      } catch (error) {
        console.error(error);
        quasar.notify({
          type: 'negative',
          message: i18n.t('questionSets.createQuestionVariantError'),
        });
      }
    }

    watch(maxPoints, async () => {
      await patchQuestion(route.params.id as string, props.question.shortId, {
        maxPoints: maxPoints.value,
      });
    });

    async function removeQuestion() {
      try {
        await deleteQuestion(route.params.id as string, props.question.shortId);
        emit('updateQuestions');
      } catch (error) {
        console.error(error);
        quasar.notify({
          type: 'negative',
          message: i18n.t('questionSets.deleteQuestionError'),
        });
      }
    }

    return {
      variantsVisible,
      maxPoints,
      variantsEdit,
      addVariant,
      variantCreatorVisible,
      questionVariantsWithTypes,
      removeQuestion,
    };
  },
});
</script>
