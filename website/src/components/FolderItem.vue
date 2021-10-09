<template>
  <q-item
    v-ripple
    clickable
    :to="`/folders/${folder.shortId}`"
  >
    <q-item-section
      avatar
      top
    >
      <q-avatar
        :icon="icon"
        color="primary"
        text-color="white"
      />
    </q-item-section>

    <q-item-section>
      <q-item-label lines="1">
        {{ folder.name }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { Folder } from 'greatest-api-schemas';

export default defineComponent({
  props: {
    shared: Boolean,
    folder: {
      type: Object as PropType<Folder>,
      required: true,
    },
  },
  setup(props) {
    return {
      icon: computed(() => (props.shared ? 'mdi-folder-account' : 'mdi-folder')),
    };
  },
});
</script>
