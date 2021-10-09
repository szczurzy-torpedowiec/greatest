<template>
  <q-page>
    <div
      class="flex header"
    >
      <q-scroll-area
        class="col-grow no-basis"
      >
        <div
          class="flex items-center q-pa-sm no-wrap breadcrumbs"
        >
          <q-skeleton
            v-if="breadcrumbs === null"
            type="rect"
            height="23px"
            width="200px"
          />
          <template v-else>
            <q-btn
              :icon="breadcrumbs.shared ? 'mdi-folder-account' : 'mdi-folder'"
              :label="$t(breadcrumbs.shared ? 'sharedFolders' : 'yourFolders')"
              to="/"
              flat
              dense
              no-caps
              size="sm"
              color="primary"
              no-wrap
            />
            <breadcrumb-divider :shared="breadcrumbs.shared" />
            <template
              v-for="item in breadcrumbs.items"
              :key="item.id"
            >
              <q-btn
                :label="item.name"
                :to="item.to"
                flat
                dense
                no-caps
                size="sm"
                color="primary"
                no-wrap
              />
              <breadcrumb-divider :folder-id="item.id" />
            </template>
            <div
              class="q-btn q-btn--dense q-btn--flat q-btn--no-uppercase
              breadcrumb-fake-button non-selectable text-no-wrap"
            >
              {{ breadcrumbs.self.name }}
            </div>
          </template>
        </div>
      </q-scroll-area>
      <q-separator vertical />
      <div class="flex items-center justify-center q-px-sm">
        <q-btn
          flat
          round
          icon="mdi-account-multiple"
          dense
          @click="showSharingDialog"
        >
          <q-tooltip>{{ $t('sharing') }}</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          icon="mdi-dots-vertical"
          dense
          class="q-ml-xs"
        >
          <q-menu>
            <q-item clickable>
              <q-item-section side>
                <q-icon name="mdi-pencil" />
              </q-item-section>
              <q-item-section>
                {{ $t('renameFolder.title') }}
              </q-item-section>
              <rename-folder-menu
                :folder-id="folderId"
                @renamed="onFolderRenamed"
              />
            </q-item>
          </q-menu>
          <q-tooltip class="text-no-wrap">
            {{ $t('otherOptions') }}
          </q-tooltip>
        </q-btn>
      </div>
    </div>
    <q-separator />
    <q-list
      bordered
      class="rounded-borders q-mx-lg q-mt-lg"
    >
      <q-item-label header>
        {{ $t('subfolders') }}
      </q-item-label>
      <folder-skeleton v-if="folderInfo === null" />
      <template v-else>
        <div
          v-if="folderInfo.subfolders.length === 0"
          class="text-center q-py-lg"
        >
          <div class="text-subtitle1">
            {{ $t('noFolders') }}
          </div>
        </div>
        <folder-item
          v-for="folder in folderInfo.subfolders"
          :key="folder.shortId"
          :folder="folder"
        />
        <div class="q-ma-sm">
          <q-btn
            class="full-width"
            color="primary"
            outline
          >
            {{ $t('createSubfolder') }}
            <create-folder-menu
              :parent-folder-id="$route.params.folderId"
              @created="onSubfolderCreated"
            />
          </q-btn>
        </div>
      </template>
    </q-list>
    <q-card
      bordered
      flat
      class="q-mx-lg q-mt-lg"
    >
      <q-item-label header>
        {{ $t('images') }}
      </q-item-label>
      <template v-if="imageGroups === null">
        <template
          v-for="i in 2"
          :key="i"
        >
          <q-separator />
          <q-item>
            <q-item-section>
              <q-skeleton
                type="text"
                width="150px"
              />
            </q-item-section>
            <q-item-section side>
              <q-skeleton
                type="circle"
                size="24px"
              />
            </q-item-section>
          </q-item>
        </template>
      </template>
      <div
        v-else-if="imageGroups.length === 0"
        class="text-center q-py-lg"
      >
        <div class="text-subtitle1">
          {{ $t('noImages') }}
        </div>
      </div>
      <template
        v-for="group in imageGroups"
        v-else
        :key="group.date"
      >
        <q-separator />
        <q-expansion-item
          class="q-pt-none"
          :label="group.dateLabel"
          default-opened
        >
          <div class="images q-pa-md">
            <router-link
              v-for="image in group.images"
              :key="image.shortId"
              v-ripple
              class="image__link"
              :to="image.to"
            >
              <q-card>
                <q-img
                  :src="image.src"
                  :srcset="image.srcset"
                  :ratio="16/9"
                  fit="contain"
                >
                  <template #loading>
                    <q-skeleton
                      width="100%"
                      height="100%"
                    />
                  </template>
                </q-img>
              </q-card>
            </router-link>
          </div>
        </q-expansion-item>
      </template>
    </q-card>
    <q-page-sticky
      position="bottom-right"
      :offset="[14, 14]"
    >
      <upload-button @uploaded="onImageUploaded" />
    </q-page-sticky>
  </q-page>
  <image-dialog
    :value="folderId && imageId"
    :folder-id="folderId"
    :image-id="imageId"
  />
  <sharing-dialog ref="sharingDialog" />
</template>

<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import { getFolderAncestors, getFolderInfo, getImages } from 'src/api';
import { useRoute } from 'vue-router';
import {
  CreateFolderReply,
  FolderAncestorsReply,
  FolderInfoReply,
  UploadImageReply,
  Image,
} from 'greatest-api-schemas';
import FolderItem from 'components/FolderItem.vue';
import FolderSkeleton from 'components/FolderSkeleton.vue';
import CreateFolderMenu from 'components/CreateFolderMenu.vue';
import BreadcrumbDivider from 'components/BreadcrumbDivider.vue';
import UploadButton from 'components/UploadButton.vue';
import { useI18n } from 'vue-i18n';
import { sortedBy, sortWithSecond } from 'src/utils';
import ImageDialog from 'components/ImageDialog.vue';
import RenameFolderMenu from 'components/RenameFolderMenu.vue';
import SharingDialog from 'components/SharingDialog.vue';

interface BreadcrumbItem {
  name: string;
  id: string;
  to?: string;
}

interface ImageItem {
  shortId: string;
  src: string;
  srcset: string;
  to: string;
}

interface ImageGroup {
  images: ImageItem[];
  date: string;
  dateLabel: string
}

export default defineComponent({
  components: {
    SharingDialog,
    RenameFolderMenu,
    ImageDialog,
    UploadButton,
    BreadcrumbDivider,
    FolderSkeleton,
    FolderItem,
    CreateFolderMenu,
  },
  setup() {
    const route = useRoute();
    const i18n = useI18n();

    const ancestors = ref<FolderAncestorsReply | null>(null);
    const folderInfo = ref<FolderInfoReply | null>(null);
    const images = ref<Image[] | null>(null);
    const fetchAncestors = async (folderId: string) => {
      ancestors.value = await getFolderAncestors(folderId);
    };
    const fetchInfo = async (folderId: string) => {
      folderInfo.value = await getFolderInfo(folderId);
    };
    const fetchImages = async (folderId: string) => {
      const reply = await getImages(folderId);
      images.value = reply.images;
    };

    const folderId = computed(() => {
      let id = route.params.folderId as undefined | string | string[];
      if (typeof id === 'object') [id] = id;
      return id;
    });

    watch(folderId, async (value) => {
      if (value === undefined) {
        console.warn('folderId is undefined');
        return;
      }
      folderInfo.value = null;
      images.value = null;
      await Promise.all([
        fetchAncestors(value),
        fetchInfo(value),
      ]);
      await fetchImages(value);
    }, {
      immediate: true,
    });

    const imageId = computed(() => {
      let id = route.params.imageId as undefined | string | string[];
      if (typeof id === 'object') [id] = id;
      return id;
    });
    const sharingDialog = ref<typeof SharingDialog | null>(null);
    return {
      folderInfo,
      ancestors,
      images,
      imageGroups: computed<ImageGroup[] | null>(() => {
        const folderIdVal = folderId.value;
        const imagesVal = images.value;
        if (folderIdVal === undefined || imagesVal === null) return null;
        const dates: Record<string, Image[]> = {};
        imagesVal.forEach((image) => {
          const dateItem = dates[image.capturedOn] ?? (dates[image.capturedOn] = []);
          dateItem.push(image);
        });
        const items = Object.entries(dates).map(([dateString, dateImages]) => ({
          date: dateString,
          dateLabel: new Date(dateString).toLocaleDateString(i18n.locale.value, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          }),
          images: sortWithSecond(dateImages.map((image) => {
            const imgBase = `/api/folders/${folderIdVal}/images/${image.shortId}`;
            return [{
              shortId: image.shortId,
              src: `${imgBase}/small.webp`,
              srcset: `${imgBase}/small.webp 1x, ${imgBase}/medium.webp 2x, ${imgBase}/large.webp 4x, ${imgBase}/full.webp`,
              to: `/folders/${folderIdVal}/images/${image.shortId}`,
            }, new Date(image.uploadedOn)];
          })),
        }));
        return sortedBy(items, 'date', true);
      }),
      breadcrumbs: computed<{
        items: BreadcrumbItem[],
        shared: boolean
      } | null>(() => {
        if (ancestors.value === null) return null;
        const items: BreadcrumbItem[] = [
          ...ancestors.value.ancestors.map((el) => ({
            name: el.name,
            to: `/folders/${el.shortId}`,
            id: el.shortId,
          })),
        ];
        items.reverse();
        return {
          items,
          shared: !ancestors.value.isOwner,
          self: ancestors.value.self,
        };
      }),
      onSubfolderCreated(reply: CreateFolderReply) {
        if (folderInfo.value === null) return;
        folderInfo.value.subfolders.push(reply);
      },
      onImageUploaded(reply: UploadImageReply) {
        if (images.value === null) return;
        images.value.push(reply);
      },
      onFolderRenamed(name: string) {
        if (folderInfo.value !== null) folderInfo.value.name = name;
        if (ancestors.value !== null) ancestors.value.self.name = name;
      },
      folderId,
      imageId,
      sharingDialog,
      showSharingDialog: () => {
        sharingDialog.value?.show();
      },
    };
  },
});
</script>

<style lang="scss" scoped>
.breadcrumb-fake-button {
  font-size: 10px;
}

$headerHeight: 48px;
.header, .breadcrumbs {
  height: $headerHeight;
}

.images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr));
  grid-auto-rows: auto;
  grid-gap: 10px;

  .image__link {
    color: initial;
    display: block;
    position: relative;
  }
}
</style>
