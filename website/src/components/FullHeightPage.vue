<template>
  <q-page :style-fn="pageStyleFn">
    <slot />
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return {
      pageStyleFn: (offset: number) => ({
        height: offset ? `calc(100vh - ${offset}px)` : '100vh',
      }),
    };
  },
});
</script>
