<template>
  <div
    v-if="signedInUser === null"
    class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center column"
  >
    <h4>{{ $t('appName') }}</h4>
    <q-btn
      color="white"
      text-color="black"
      type="a"
      href="/auth/sign-in/google"
    >
      {{ $t('signIn.google') }}
    </q-btn>
  </div>
  <q-layout
    v-else
    view="lHh Lpr lFf"
  >
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          {{ $t('appName') }}
        </q-toolbar-title>

        <q-btn round>
          <q-avatar size="40px">
            <img
              :src="signedInUser.avatarUrl"
              referrerpolicy="no-referrer"
              :alt="signedInUser.name"
            >
          </q-avatar>
          <account-menu />
          <q-tooltip>
            {{ $t('account') }}
          </q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import EssentialLink from 'components/EssentialLink.vue';
import AccountMenu from 'components/AccountMenu.vue';

const linksList = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev',
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework',
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'mdi-chat',
    link: 'https://chat.quasar.dev',
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev',
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev',
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev',
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev',
  },
];

import { defineComponent, ref } from 'vue';
import state from 'src/state';

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink,
    AccountMenu,
  },

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      signedInUser: state.signedInUser,
    };
  },
});
</script>
