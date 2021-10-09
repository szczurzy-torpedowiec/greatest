<template>
  <q-page class="q-mx-auto q-pa-md api-tokens-page">
    <q-card
      bordered
      flat
    >
      <q-form @submit.prevent="generateToken">
        <q-card-section class="text-h6">
          {{ $t('generateApiToken.title') }}
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="newTokenName"
            filled
            :label="$t('generateApiToken.name')"
            :maxlength="64"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            type="submit"
            color="primary"
            :disable="newTokenDisabled"
          >
            {{ $t('generateApiToken.generate') }}
          </q-btn>
        </q-card-actions>
      </q-form>
    </q-card>

    <q-list
      bordered
      class="q-mt-md rounded-borders"
      separator
    >
      <q-item v-if="tokenItems === null">
        <q-item-section>
          <q-item-label>
            <q-skeleton
              type="text"
              height="24px"
            />
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-skeleton
            type="circle"
            size="24px"
          />
        </q-item-section>
      </q-item>
      <div
        v-else-if="tokenItems.length === 0"
        class="text-center q-py-lg"
      >
        <div class="text-subtitle1">
          {{ $t('noApiTokens') }}
        </div>
      </div>
      <q-item
        v-for="token in tokenItems"
        v-else
        :key="token.tokenId"
      >
        <div class="full-width">
          <div class="row full-width">
            <q-item-section>
              <q-item-label>{{ token.name }}</q-item-label>
              <q-item-label caption>
                {{ token.createdOnString }}
              </q-item-label>
            </q-item-section>
            <q-item-section
              side
              @click="revoke(token.tokenId)"
            >
              <q-btn
                icon="mdi-delete"
                round
                flat
              >
                <q-tooltip>{{ $t('revokeToken.button') }}</q-tooltip>
              </q-btn>
            </q-item-section>
          </div>
          <q-card
            v-if="token.token"
            bordered
            flat
            class="q-pa-sm q-mt-sm row items-center token-card"
          >
            <div class="col-grow no-basis">
              <code class="token-value">{{ token.token }}</code>
              <div class="text-caption">
                {{ $t('tokenNotice') }}
              </div>
            </div>
            <q-btn
              icon="mdi-content-copy"
              flat
              round
              class="q-ml-xs"
              color="primary"
              @click="copyToken(token.token)"
            >
              <q-tooltip>{{ $t('clipboardCopy') }}</q-tooltip>
            </q-btn>
          </q-card>
        </div>
      </q-item>
    </q-list>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { generateApiToken, listApiTokens, revokeApiToken } from 'src/api';
import { sortedBy } from 'src/utils';
import { copyToClipboard, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { RevealedToken, Token } from 'greatest-api-schemas';

const $q = useQuasar();
const $i18n = useI18n();

const tokens = ref<(Token | RevealedToken)[] | null>(null);
const tokenItems = computed(() => {
  if (tokens.value === null) return null;
  return sortedBy(tokens.value, (x) => new Date(x.createdOn), true)
    .map((token) => ({
      ...token,
      createdOnString: new Date(token.createdOn).toLocaleString($i18n.locale.value, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      }),
    }));
});

const newTokenName = ref('');
const newTokenDisabled = computed(
  () => tokens.value === null || newTokenName.value.trim().length === 0,
);

async function generateToken() {
  if (newTokenDisabled.value) return;
  try {
    const response = await generateApiToken(newTokenName.value.trim());
    if (tokens.value === null) return;
    tokens.value.push({
      ...response,
    });
    newTokenName.value = '';
  } catch (error) {
    console.error(error);
    $q.notify({
      type: 'negative',
      message: $i18n.t('generateApiToken.error'),
    });
  }
}

onMounted(async () => {
  try {
    // TODO: Handle error;
    const response = await listApiTokens();
    tokens.value = response.tokens;
  } catch (error) {
    console.error(error);
  }
});

function revoke(tokenId: string) {
  $q.dialog({
    title: $i18n.t('revokeToken.confirm.title'),
    message: $i18n.t('revokeToken.confirm.message'),
    ok: $i18n.t('revokeToken.confirm.ok'),
    cancel: true,
  }).onOk(async () => {
    try {
      await revokeApiToken('id', tokenId);
      if (tokens.value !== null) {
        tokens.value = tokens.value.filter((token) => token.tokenId !== tokenId);
      }
    } catch (error) {
      console.error(error);
      $q.notify({
        type: 'negative',
        message: $i18n.t('revokeToken.error'),
      });
    }
  });
}

async function copyToken(token: string) {
  try {
    await copyToClipboard(token);
    $q.notify({
      message: $i18n.t('copySuccess'),
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: $i18n.t('copyFailed'),
    });
  }
}
</script>

<style lang="scss" scoped>
.api-tokens-page {
  max-width: 400px;
}

.token-card {
  border-color: var(--q-primary);
}

.token-value {
  overflow-wrap: anywhere;
}
</style>
