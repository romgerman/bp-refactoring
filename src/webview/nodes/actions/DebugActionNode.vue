<template>
  <NodeWrapper>
    <template #header>Debug</template>
    <div class="target-handles">
      <Handle id="any" type="target" :position="Position.Left" data-name="Any" />
    </div>
  </NodeWrapper>
</template>

<script setup lang="ts">
import type { NodeProps } from "@vue-flow/core";
import { Handle, Position } from "@vue-flow/core";
import NodeWrapper from "../NodeWrapper.vue";

const props = defineProps<NodeProps>();
</script>
