<template>
  <q-layout
    view="hHh Lpr lFf"
  >
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          {{ $t('appName') }}
        </q-toolbar-title>
        <q-skeleton
          v-if="!viewerLoaded"
          type="QBtn"
        />
        <q-btn
          v-else-if="viewer"
          round
          flat
        >
          <q-avatar>
            <img :src="viewer.avatarUrl">
          </q-avatar>
          <q-menu>
            <q-card>
              <q-card-section class="row items-center">
                <q-avatar>
                  <img :src="viewer.avatarUrl">
                </q-avatar>
                <div class="col q-ml-sm">
                  {{ viewer.name }}
                </div>
              </q-card-section>
              <q-card-actions vertical>
                <q-btn
                  :label="$t('signIn.apiTokens')"
                  color="primary"
                  outline
                  @click="apiTokensDialog = !apiTokensDialog"
                />
                <q-btn
                  :label="$t('signIn.signOut')"
                  color="primary"
                  type="a"
                  href="/auth/sign-out"
                />
              </q-card-actions>
            </q-card>
          </q-menu>
        </q-btn>
        <div v-else>
          <div class="q-gutter-md xs-hide">
            <q-btn
              type="a"
              href="/auth/sign-in/google"
              :label="$t('signIn.signInGoogle')"
              outline
            />
            <q-btn
              :label="$t('signIn.signInDemo')"
              outline
              @click="demoUserDialog = !demoUserDialog"
            />
          </div>
          <q-btn
            class="xs"
            flat
            icon="login"
          >
            <q-menu>
              <q-card>
                <q-card-actions vertical>
                  <q-btn
                    color="primary"
                    outline
                    :label="$t('signIn.signInDemo')"
                    @click="demoUserDialog = !demoUserDialog"
                  />
                  <q-btn
                    type="a"
                    href="/auth/sign-in/google"
                    color="primary"
                    :label="$t('signIn.signInGoogle')"
                  />
                </q-card-actions>
              </q-card>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item
          v-for="link in menu"
          :key="link.location"
          v-ripple
          :to="link.location"
          clickable
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            {{ link.title }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-dialog
      v-model="demoUserDialog"
    >
      <demo-sign-in />
    </q-dialog>
    <q-dialog
      v-model="apiTokensDialog"
    >
      <api-tokens />
    </q-dialog>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { getViewer } from 'src/api';
import { Viewer } from 'greatest-api-schemas';
import DemoSignIn from 'components/signIn/DemoSignIn.vue';
import ApiTokens from 'components/signIn/ApiTokens.vue';

export default defineComponent({
  name: 'MainLayout',
  components: {
    DemoSignIn,
    ApiTokens,
  },
  setup() {
    const leftDrawerOpen = ref(false);
    const viewer = ref<Viewer | null>(null);
    const viewerLoaded = ref<boolean>(false);
    const demoUserDialog = ref<boolean>(false);
    const apiTokensDialog = ref<boolean>(false);

    const menu = [
      {
        title: 'Question sets',
        icon: 'folder',
        location: '/question-sets',
      },
      {
        title: 'Tests',
        icon: 'description',
        location: '/tests',
      },
    ];

    async function loadViewer() {
      viewer.value = await getViewer();
      viewerLoaded.value = true;
    }

    onMounted(loadViewer);

    return {
      leftDrawerOpen,
      menu,
      viewer,
      viewerLoaded,
      demoUserDialog,
      apiTokensDialog,
    };
  },
});
</script>
