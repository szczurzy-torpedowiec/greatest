<template>
  <q-card>
    <q-card-section
      horizontal
    >
      <q-card-section class="col">
        <div class="text-h6">
          {{ question.question }}
        </div>
        <q-btn
          flat
          label="Warianty"
          icon="expand_more"
          @click="variantsVisible = !variantsVisible"
        />
      </q-card-section>
      <q-card-actions>
        <q-select
          v-model="questionType"
          outlined
          dense
          :options="questionTypes"
          label="Typ pytania"
        />
        <q-input
          type="number"
          label="Liczba punktów"
          dense
          outlined
          class="q-mx-sm"
        />
        <q-btn
          flat
          color="red"
          icon="delete"
        />
      </q-card-actions>
    </q-card-section>
    <q-card-section
      v-if="variantsVisible"
    >
      <q-card
        bordered
        flat
      >
        <q-card-section>
          <q-input
            label="Pytanie"
          />
          <div class="row justify-evenly">
            <q-input
              outlined
              color="green"
              class="q-mt-md q-mx-sm col-5"
              label="Poprawna odpowiedź"
            >
              <template #prepend>
                <q-icon
                  name="check"
                  color="green"
                />
              </template>
            </q-input>
            <q-input
              outlined
              color="red"
              class="q-mt-md q-mx-sm col-5"
              label="Niepoprawna odpowiedź"
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
      </q-card>
      <q-btn
        color="primary"
        label="Dodaj wariant"
        icon="edit"
        class="full-width q-ma-md"
      />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  ref,
} from 'vue';

interface Question {
  question: string,
  correctAnswer: string,
  incorrectAnswers: string[],
}

export default defineComponent({
  name: 'DatasetQuestion',
  props: {
    question: {
      type: Object as PropType<Question>,
      required: true,
    },
  },
  setup() {
    const variantsVisible = ref(false);
    const questionType = ref('Otwarte');
    const questionTypes = ['Otwarte', 'Zamknięte'];
    return { variantsVisible, questionTypes, questionType };
  },
});
</script>

<style scoped>

</style>
