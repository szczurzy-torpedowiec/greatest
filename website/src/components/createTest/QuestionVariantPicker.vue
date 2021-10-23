<template>
  <q-btn-toggle
    :model-value="modelValue"
    toggle-color="primary"
    :options="options"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { getTypeValidator, getVariantSymbol } from 'src/utils';

export default defineComponent({
  props: {
    modelValue: {
      type: Number,
      required: true,
    },
    variantCount: {
      type: Number,
      required: true,
    },
  },
  emits: {
    'update:modelValue': getTypeValidator<[value: number]>(),
  },
  setup(props) {
    return {
      options: computed(() => {
        const options = [];
        for (let variant = 0; variant < props.variantCount; variant += 1) {
          options.push({
            label: getVariantSymbol(variant),
            value: variant,
          });
        }
        return options;
      }),
    };
  },
});
</script>
