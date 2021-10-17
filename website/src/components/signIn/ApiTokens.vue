<template>
  <q-card
    class="q-pa-lg"
    style="width: 700px"
  >
    <q-card-section>
      <div class="row">
        <div class="text-h4 col">
          {{ $t('signIn.apiTokens') }}
        </div>
        <div>
          <q-btn
            flat
            icon="add"
          >
            <q-menu>
              <div class="q-pa-md">
                <q-input
                  v-model="newTokenName"
                  class="q-my-sm"
                  outlined
                  @keydown.enter="submitToken"
                />
                <div class="row justify-end">
                  <q-btn
                    v-close-popup
                    color="primary"
                    :label="$t('common.add')"
                    @click="submitToken"
                  />
                </div>
              </div>
            </q-menu>
          </q-btn>
        </div>
      </div>
      <q-card
        v-for="token in tokens"
        :key="token.tokenId"
        class="q-my-md"
        bordered
        flat
      >
        <q-card-section horizontal>
          <q-card-section class="col">
            <div class="row items-center">
              {{ token.name }}
            </div>
            <div class="row items-center">
              {{ $t('signIn.created') }} {{ token.createdOn }}
            </div>
          </q-card-section>
          <q-card-section class="row items-center">
            <q-btn
              flat
              icon="delete"
              color="red"
              dense
            >
              <delete-confirm-menu
                :submit="() => deleteToken(token.tokenId)"
              />
            </q-btn>
          </q-card-section>
        </q-card-section>
      </q-card>
      <div
        v-if="!tokens[0]"
        class="items-center column q-ma-lg"
      >
        {{ $t('signIn.noApiTokens') }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import {
  defineComponent, onMounted, ref,
} from 'vue';

import { listApiTokens, generateApiToken, revokeApiToken } from 'src/api';
import { Token } from 'greatest-api-schemas';
import DeleteConfirmMenu from 'components/DeleteConfirmMenu.vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'ApiTokens',
  components: {
    DeleteConfirmMenu,
  },
  setup() {
    const tokens = ref<Token[]>([]);
    const newTokenName = ref<string>('');

    const quasar = useQuasar();
    const i18n = useI18n();

    async function getApiTokens() {
      try {
        tokens.value = (await listApiTokens()).tokens.map((token) => ({
          ...token,
          createdOn: new Date(token.createdOn).toLocaleDateString(i18n.locale.value, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          }),
        }));
      } catch (error) {
        quasar.notify({
          type: 'negative',
          message: i18n.t('signIn.tokenListError'),
        });
      }
    }

    async function submitToken() {
      try {
        const key = await generateApiToken(newTokenName.value);
        try {
          await navigator.clipboard.writeText(key.token);
          quasar.notify({
            message: i18n.t('signIn.tokenCopied'),
          });
        } catch (error) {
          quasar.notify({
            message: `${i18n.t('signIn.tokenCopyFallback')} ${key.token}`,
          });
        }
      } catch (error) {
        quasar.notify({
          type: 'negative',
          message: i18n.t('signIn.tokenError'),
        });
      }
      await getApiTokens();
    }

    async function deleteToken(id: string) {
      try {
        await revokeApiToken('id', id);
        await getApiTokens();
      } catch (error) {
        console.error(error);
        quasar.notify({
          type: 'negative',
          message: i18n.t('signIn.tokenDeleteError'),
        });
      }
    }

    onMounted(getApiTokens);

    return {
      tokens,
      newTokenName,
      submitToken,
      deleteToken,
    };
  },
});
</script>

<style scoped>

</style>
