<template>
  <q-dialog
    :model-value="show"
    no-route-dismiss
    maximized
    full-height
    @hide="onHide"
  >
    <q-card
      dark
      class="full-height"
    >
      <div class="image-contain full-width full-height">
        <img
          :src="imageSrc"
          loading="lazy"
          :alt="$t('imageAlt')"
        >
      </div>
      <div class="top-buttons q-pa-md row">
        <q-btn
          flat
          round
          icon="mdi-arrow-left"
          @click="onHide"
        />
        <q-space />
        <q-btn
          flat
          round
          icon="mdi-information"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import {
  computed, PropType, ref, watch,
} from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  folderId: {
    type: String as PropType<string | undefined>,
    default: undefined,
    required: false,
  },
  imageId: {
    type: String as PropType<string | undefined>,
    default: undefined,
    required: false,
  },
});

const image = ref(null);
const imageSrc = ref<null | string>(null);
watch(
  () => ({ folderId: props.folderId, imageId: props.imageId }),
  ({ folderId, imageId }) => {
    if (folderId === undefined || imageId === undefined) {
      image.value = null;
    } else {
      imageSrc.value = `/api/folders/${folderId}/images/${imageId}/large.webp`;
    }
  }, {
    immediate: true,
  },
);

const show = computed(() => props.folderId !== undefined && props.imageId !== undefined);
async function onHide() {
  if (props.folderId === undefined) await router.push('/');
  else await router.push(`/folders/${props.folderId}`);
}
</script>

<style lang="scss" scoped>
.top-buttons {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
