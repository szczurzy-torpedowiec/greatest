<template>
  <q-card
    style="width: 700px"
  >
    <q-card-section class="row items-center">
      <div class="text-h6 col">
        {{ $t('signIn.apiTokens') }}
      </div>
      <q-btn
        flat
        :label="$t('signIn.newToken')"
        color="primary"
        icon="add"
      >
        <q-popup-proxy
          v-model="showNewTokenPopup"
          no-refocus
        >
          <q-card>
            <q-form @submit.prevent="submitToken">
              <q-card-section class="q-pb-none">
                <q-input
                  v-model="newTokenName"
                  class="q-my-sm"
                  filled
                  autofocus
                  :label="$t('signIn.tokenName')"
                />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  type="submit"
                  color="primary"
                  :label="$t('common.add')"
                />
              </q-card-actions>
            </q-form>
          </q-card>
        </q-popup-proxy>
      </q-btn>
    </q-card-section>
    <q-card-section>
      <div
        v-if="tokens === null"
        class="q-ma-lg row"
      >
        <q-skeleton
          class="col"
          type="rect"
        />
      </div>
      <div
        v-else-if="tokens.length === 0"
        class="text-h6 text-center q-px-sm q-py-lg text-grey-8"
      >
        {{ $t('signIn.noApiTokens') }}
      </div>
      <q-card
        v-for="token in tokens"
        v-else
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
              round
            >
              <delete-confirm-menu
                :submit="() => deleteToken(token.tokenId)"
              />
            </q-btn>
          </q-card-section>
        </q-card-section>
      </q-card>
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
import { copyToClipboard, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'ApiTokens',
  components: {
    DeleteConfirmMenu,
  },
  setup() {
    const tokens = ref<Token[] | null>(null);
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

    const showNewTokenPopup = ref(false);
    async function submitToken() {
      try {
        const key = await generateApiToken(newTokenName.value);
        try {
          await copyToClipboard(key.token);
          quasar.notify({
            message: i18n.t('signIn.tokenCopied'),
          });
        } catch (error) {
          quasar.notify({
            message: i18n.t('signIn.tokenCopyFallback', { token: key.token }),
          });
        }
        showNewTokenPopup.value = false;
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
      showNewTokenPopup,
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
