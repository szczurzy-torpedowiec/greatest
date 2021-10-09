<template>
  <q-btn
    flat
    icon="mdi-chevron-right"
    size="sm"
    dense
    :loading="items === null && show"
    @click="onClick"
  >
    <q-menu
      v-if="items !== null"
      v-model="show"
      anchor="bottom right"
      self="top left"
      :offset="[-16, 0]"
      no-parent-event
      auto-close
    >
      <q-item
        v-for="item in items"
        :key="item.shortId"
        dense
        :to="`/folders/${item.shortId}`"
      >
        <q-item-section>{{ item.name }}</q-item-section>
      </q-item>
    </q-menu>
  </q-btn>
</template>

<script lang="ts">
import {
  defineComponent, ref, watch,
} from 'vue';
import { Folder } from 'greatest-api-schemas';
import { getFolderInfo, listUserFolders } from 'src/api';

export default defineComponent({
  props: {
    folderId: {
      type: String,
      required: false,
      default: undefined,
    },
    shared: Boolean,
  },
  setup(props) {
    const show = ref(false);
    const items = ref<Folder[] | null>(null);
    watch(() => props.folderId, () => {
      items.value = null;
      show.value = false;
    }, {
      immediate: false,
    });
    return {
      show,
      items,
      async onClick() {
        show.value = true;
        if (items.value !== null) return;
        // TODO: Handle errors
        if (props.folderId === undefined) {
          const reply = await listUserFolders();
          items.value = props.shared ? reply.sharedFolders : reply.ownedFolders;
        } else {
          const reply = await getFolderInfo(props.folderId);
          items.value = reply.subfolders;
        }
      },
    };
  },
});
</script>
