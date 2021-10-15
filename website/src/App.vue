<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import { titleState } from 'src/state/title';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'App',
  setup() {
    const i18n = useI18n();
    watch(() => {
      if (typeof titleState.value === 'string') return `${titleState.value} | ${i18n.t('appName')}`;
      return i18n.t('appName');
    }, (value) => { document.title = value; });
  },
});
</script>
