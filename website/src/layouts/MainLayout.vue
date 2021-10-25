<template>
  <q-layout
    view="hHh Lpr lFf"
  >
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="!isHome"
          flat
          round
          icon="mdi-home"
          to="/"
        />
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
  computed,
  defineComponent,
} from 'vue';
import LanguageSelector from 'components/LanguageSelector.vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'MainLayout',
  components: {
    LanguageSelector,
  },
  setup() {
    const route = useRoute();
    return {
      isHome: computed(() => route.name === 'Home'),
    };
  },
});
</script>
