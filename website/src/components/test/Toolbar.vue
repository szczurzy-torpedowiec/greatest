<template>
  <q-tabs>
    <q-route-tab
      :to="getPath('questions')"
      exact
      replace
      :label="$t('test.tabs.questions')"
    />
    <q-route-tab
      :to="getPath('sheets')"
      exact
      replace
      :label="$t('test.tabs.sheets')"
    />
    <q-route-tab
      :to="scansPath"
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
      getPath: (tab: string): string | undefined => {
        if (testToolbarState.value === null) return undefined;
        return `/tests/${testToolbarState.value.testShortId}/${tab}`;
      },
      scansPath: computed(() => ({
        name: 'TestScanTab',
      })),
      unassignedScanCount: computed(() => testToolbarState.value?.unassignedScanCount ?? 0),
    };
  },
});
</script>
