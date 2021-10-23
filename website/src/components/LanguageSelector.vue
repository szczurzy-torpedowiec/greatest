<template>
  <q-btn
    flat
    icon="translate"
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
          @click="useLocale(availableLocale)"
        >
          <q-item-section avatar>
            <img :src="$t('languageIcon', availableLocale)">
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
import { useStorage } from 'src/utils';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'LanguageSelector',
  setup() {
    const locale = useStorage('language', () => 'en-US');
    const quasar = useQuasar();
    const i18n = useI18n();

    function useLocale(selectedLocale: string) {
      locale.value = selectedLocale;
      quasar.notify({
        message: i18n.t('common.requestRefresh'),
      });
    }
    return {
      useLocale,
    };
  },
});
</script>
