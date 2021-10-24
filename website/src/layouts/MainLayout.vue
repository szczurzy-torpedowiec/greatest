<template>
  <q-layout
    view="hHh Lpr lFf"
  >
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          {{ $t('appName') }}
        </q-toolbar-title>
        <language-selector />
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import {
  defineComponent,
} from 'vue';
import LanguageSelector from 'components/LanguageSelector.vue';

export default defineComponent({
  name: 'MainLayout',
  components: {
    LanguageSelector,
  },
});
</script>
