<template>
  <q-page padding>
    <div class="row justify-center">
      <div
        class="col q-gutter-y-md"
        style="max-width: 600px"
      >
        <q-card
          flat
          bordered
        >
          <q-form @submit.prevent="onStudentSubmit">
            <q-card-section class="text-h6">
              {{ $t('common.student') }}
            </q-card-section>
            <q-card-section class="q-py-none">
              <q-input
                v-model="testCodeInput"
                :label="$t('common.testCode')"
                outlined
                autofocus
              />
            </q-card-section>
            <q-card-actions class="justify-end q-mr-sm">
              <q-btn
                color="primary"
                :label="$t('common.check')"
                :disable="!testCodeValid"
                :loading="testCodeLoading"
                type="submit"
              />
            </q-card-actions>
          </q-form>
        </q-card>
        <q-card
          flat
          bordered
        >
          <q-card-section class="text-h6">
            {{ $t('common.teacher') }}
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div
              v-if="!viewer"
              class="q-gutter-y-sm"
            >
              <q-btn
                class="full-width"
                type="a"
                href="/auth/sign-in/google"
                :label="$t('signIn.signInGoogle')"
                color="primary"
              />
              <q-btn
                class="full-width"
                :label="$t('signIn.signInDemo')"
                color="primary"
                @click="demoUserDialog = !demoUserDialog"
              />
            </div>
            <q-btn
              v-else
              class="full-width"
              :label="$t('signIn.goToPanel')"
              color="primary"
              to="teacher"
            />
          </q-card-section>
        </q-card>
      </div>
      <div
        v-if="$q.screen.gt.sm"
        class="col-8 q-ml-md"
      >
        <q-markdown :src="readme" />
      </div>
    </div>
    <q-markdown
      v-if="!$q.screen.gt.sm"
      class="q-mt-sm"
      :src="readme"
    />
    <q-dialog
      v-model="demoUserDialog"
    >
      <demo-sign-in />
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import {
  computed,
  defineComponent, onMounted, ref,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import DemoSignIn from 'components/signIn/DemoSignIn.vue';
import { checkStudent, getViewer } from 'src/api';
import { Viewer } from 'greatest-api-schemas';
import readme from 'assets/readme.md';

export default defineComponent({
  name: 'PageIndex',
  components: {
    DemoSignIn,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const quasar = useQuasar();
    const i18n = useI18n();

    const demoUserDialog = ref<boolean>(false);
    const viewer = ref<Viewer | null>(null);

    onMounted(async () => {
      viewer.value = await getViewer();
      if (route.query.error === 'authRequired') {
        quasar.notify({
          type: 'negative',
          message: i18n.t('signIn.authRequired'),
        });
      }
    });

    const testCodeInput = ref('');
    const testCodeValid = computed(() => testCodeInput.value.trim() !== '');
    const testCodeLoading = ref(false);

    return {
      readme,
      demoUserDialog,
      viewer,
      testCodeInput,
      testCodeValid,
      testCodeLoading,
      onStudentSubmit: async () => {
        if (!testCodeValid.value || testCodeLoading.value) return;
        testCodeLoading.value = true;
        try {
          const phrase = testCodeInput.value.trim();
          const response = await checkStudent(phrase);
          if (response.found) {
            await router.push({ path: '/student', query: { phrase } });
          } else {
            quasar.notify({
              type: 'negative',
              message: i18n.t('home.studentSheetNotFound'),
            });
          }
        } catch (error) {
          console.error(error);
          quasar.notify({
            type: 'negative',
            message: i18n.t('home.studentSheetError'),
          });
        }
        testCodeLoading.value = false;
      },
    };
  },
});
</script>
