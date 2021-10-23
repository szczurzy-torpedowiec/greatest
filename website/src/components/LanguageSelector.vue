<template>
  <q-btn
    flat
    round
    icon="translate"
    class="q-mr-sm"
  >
    <q-menu>
      <q-list>
        <q-item
          v-for="availableLocale in $i18n.availableLocales"
          :key="availableLocale"
          v-ripple
          v-close-popup
          clickable
          :active="availableLocale === $i18n.locale"
          active-class="bg-teal-1 text-grey-8"
          @click="setLocale(availableLocale)"
        >
          <q-item-section avatar>
            <img
              :src="$t('languageIcon', availableLocale)"
              :alt="$t('languageName', availableLocale)"
            >
          </q-item-section>
          <q-item-section>
            {{ $t('languageName', availableLocale) }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>
<script lang="ts">
import {
  defineComponent,
} from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'LanguageSelector',
  setup() {
    const i18n = useI18n({
      useScope: 'global',
    });

    function setLocale(selectedLocale: string) {
      i18n.locale.value = selectedLocale;
      window.localStorage.setItem('language', selectedLocale);
    }
    return {
      setLocale,
    };
  },
});
</script>
