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
          clickable
          @click="redirect(link.location)"
          v-ripple
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
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'MainLayout',
  setup() {
    const router = useRouter();
    const leftDrawerOpen = ref(false);

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

    async function redirect(location: string) {
      await router.push(location);
    }

    return { leftDrawerOpen, menu, redirect };
  },
});
</script>
