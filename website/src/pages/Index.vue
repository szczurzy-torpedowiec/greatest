<template>
  Hello world!
</template>

<script lang="ts">
import {
  defineComponent, onMounted,
} from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const route = useRoute();
    const quasar = useQuasar();
    const i18n = useI18n();

    onMounted(() => {
      if (route.query.error === 'authRequired') {
        quasar.notify({
          type: 'negative',
          message: i18n.t('signIn.authRequired'),
        });
      }
    });
  },
});
</script>
