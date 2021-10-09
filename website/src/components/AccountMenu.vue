<template>
  <q-menu
    anchor="bottom right"
    self="top right"
  >
    <q-card class="account-menu__card">
      <q-card-section>
        <div class="text-h5 text-center">
          {{ signedInUser?.name }}
        </div>
        <div class="text-subtitle1 text-weight-light text-center">
          {{ signedInUser?.email }}
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions>
        <q-btn
          type="a"
          href="/api-tokens"
          flat
          class="full-width"
          color="primary"
        >
          {{ $t('manageApiTokens') }}
        </q-btn>
      </q-card-actions>
      <q-separator />
      <q-card-actions>
        <q-btn
          type="a"
          href="/auth/sign-out"
          flat
          class="full-width"
          color="primary"
        >
          {{ $t('signOut') }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import state from 'src/state';

export default defineComponent({
  setup() {
    return {
      signedInUser: state.signedInUser,
    };
  },
});
</script>

<style lang="scss" scoped>
  .account-menu__card {
    min-width: 300px;
  }
</style>
