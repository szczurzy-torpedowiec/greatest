<template>
  <q-dialog v-model="showValue">
    Witaj
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const showValue = ref(false);
    return {
      showValue,
      show: () => {
        showValue.value = true;
      },
    };
  },
});
</script>
