<template>
  <q-tabs>
    <q-route-tab
      to="questions"
      exact
      replace
      :label="$t('test.tabs.questions')"
    />
    <q-route-tab
      to="sheets"
      exact
      replace
      :label="$t('test.tabs.sheets')"
    />
    <q-route-tab
      to="scans"
      exact
      replace
      :label="$t('test.tabs.scans')"
    >
      <q-badge
        v-if="unassignedScanCount > 0"
        color="red"
        floating
      >
        {{ unassignedScanCount }}
      </q-badge>
    </q-route-tab>
  </q-tabs>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { testToolbarState } from 'src/state/test-toolbar';

export default defineComponent({
  setup() {
    return {
      unassignedScanCount: computed(() => testToolbarState.value?.unassignedScanCount ?? 0),
    };
  },
});
</script>
