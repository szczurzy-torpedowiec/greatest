<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { preFetch } from 'quasar/wrappers';
import { getUserInfo } from 'src/api';
import state from 'src/state';
import { Loading } from 'quasar';

export default defineComponent({
  name: 'App',
  preFetch: preFetch(async () => {
    Loading.show({
      delay: 300,
    });
    state.signedInUser = await getUserInfo();
    Loading.hide();
  }),
});
</script>
