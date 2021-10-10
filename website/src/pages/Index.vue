<template>
  <q-page class="row items-center justify-evenly column">
    {{ $t('appName') }}
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent,
} from 'vue';

export default defineComponent({
  name: 'PageIndex',
});
</script>
