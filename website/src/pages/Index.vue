<template>
  <q-page class="row items-center justify-evenly column">
    <q-list
      bordered
      class="rounded-borders folders-list"
    >
      <q-item-label header>
        {{ $t('yourFolders') }}
      </q-item-label>
      <folder-skeleton v-if="userFolders === null" />
      <template v-else>
        <div
          v-if="userFolders.ownedFolders.length === 0"
          class="text-center q-py-lg"
        >
          <div class="text-subtitle1">
            {{ $t('noFolders') }}
          </div>
        </div>
        <folder-item
          v-for="folder in userFolders.ownedFolders"
          :key="folder.shortId"
          :folder="folder"
        />
        <div class="q-ma-sm">
          <q-btn
            class="full-width"
            color="primary"
            outline
          >
            {{ $t('createFolder.title') }}
            <create-folder-menu @created="onCreated" />
          </q-btn>
        </div>
      </template>
      <q-separator />
      <q-item-label header>
        {{ $t('sharedFolders') }}
      </q-item-label>
      <folder-skeleton v-if="userFolders === null" />
      <template v-else>
        <div
          v-if="userFolders.sharedFolders.length === 0"
          class="text-center q-py-lg"
        >
          <div class="text-subtitle1">
            {{ $t('noFolders') }}
          </div>
        </div>
        <folder-item
          v-for="folder in userFolders.sharedFolders"
          :key="folder.shortId"
          :folder="folder"
          shared
        />
      </template>
    </q-list>
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent, onMounted, ref,
} from 'vue';
import { listUserFolders } from 'src/api';
import { CreateFolderReply, ListUserFoldersReply } from 'greatest-api-schemas';
import FolderItem from 'components/FolderItem.vue';
import FolderSkeleton from 'components/FolderSkeleton.vue';
import CreateFolderMenu from 'components/CreateFolderMenu.vue';

export default defineComponent({
  name: 'PageIndex',
  components: { CreateFolderMenu, FolderSkeleton, FolderItem },
  setup() {
    const userFolders = ref<ListUserFoldersReply | null>(null);
    const load = async () => {
      userFolders.value = null;
      userFolders.value = await listUserFolders();
    };
    onMounted(async () => {
      await load();
    });
    return {
      userFolders,
      onCreated(reply: CreateFolderReply) {
        userFolders.value?.ownedFolders?.push(reply);
      },
    };
  },
});
</script>

<style lang="scss" scoped>
  .folders-list {
    min-width: 300px;
  }
</style>
