<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
      <div class="error404-title">
        {{ $t('404.title') }}
      </div>

      <div
        class="text-h2"
        style="opacity:.4"
      >
        {{ $t('404.subtitle') }}
      </div>
      <div
        class="text-h5 error404-dim q-mt-md"
      >
        {{ $t('404.notFunny') }}
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        to="/"
        :label="$t('404.goHome')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Error404',
});
</script>

<style lang="scss" scoped>
.error404-title {
  font-size: 30vh
}

.error404-dim {
  opacity: 0.4;
}
</style>
