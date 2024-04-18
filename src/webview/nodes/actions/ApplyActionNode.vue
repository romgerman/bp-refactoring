<template>
  <NodeWrapper>
    <template #header>Apply Changes</template>
    <div class="target-handles">
      <Handle id="array" type="target" :position="Position.Left" data-name="Array" />
    </div>
  </NodeWrapper>
</template>

<script setup lang="ts">
import type { NodeProps } from "@vue-flow/core";
import { Handle, Position } from "@vue-flow/core";
import NodeWrapper from "../NodeWrapper.vue";

const props = defineProps<NodeProps>();
</script>
