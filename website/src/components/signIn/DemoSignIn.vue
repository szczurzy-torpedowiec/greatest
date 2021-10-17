<template>
  <q-card
    class="q-pa-lg"
    style="width: 700px"
  >
    <q-card-section class="text-h4">
      {{ $t('signIn.signInDemo') }}
    </q-card-section>
    <q-card-section>
      <q-card
        flat
        bordered
      >
        <div v-if="credentials">
          <q-card-section class="q-pb-none">
            {{ $t('signIn.email') }}: {{ credentials.email }}<br>
            {{ $t('signIn.password') }}: {{ credentials.password }}
          </q-card-section>
          <q-card-actions class="justify-end">
            <q-btn
              flat
              :label="$t('common.use')"
              @click="useCredentials"
            />
          </q-card-actions>
        </div>

        <div v-else>
          <q-card-section class="q-pb-none">
            {{ $t('signIn.generateMessage') }}
          </q-card-section>
          <q-card-actions class="justify-end">
            <q-btn
              flat
              :label="$t('signIn.generate')"
              @click="generateCredentials"
            />
          </q-card-actions>
        </div>
      </q-card>
    </q-card-section>
    <q-card-section>
      <q-form
        class="q-gutter-md"
        action="/auth/sign-in/demo"
        method="POST"
      >
        <q-input
          v-model="email"
          outlined
          :label="$t('signIn.email')"
          type="email"
          name="email"
        />
        <q-input
          v-model="password"
          :label="$t('signIn.password')"
          outlined
          type="password"
          name="password"
        />
        <q-btn
          color="primary"
          :label="$t('signIn.signIn')"
          type="submit"
        />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import {
  defineComponent, ref,
} from 'vue';
import { createDemoUser } from 'src/api';
import { CreateDemoUserReply } from 'greatest-api-schemas';

export default defineComponent({
  name: 'DemoSignIn',
  setup() {
    const email = ref<string>('');
    const password = ref<string>('');
    const credentials = ref<CreateDemoUserReply>();

    async function generateCredentials() {
      credentials.value = await createDemoUser();
    }

    function useCredentials() {
      if (credentials.value) {
        email.value = credentials.value?.email;
        password.value = credentials.value?.password;
      }
    }

    return {
      email,
      password,
      credentials,
      generateCredentials,
      useCredentials,
    };
  },
});
</script>

<style scoped>

</style>
