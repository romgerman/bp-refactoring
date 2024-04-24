<template>
  <NodeWrapper>
    <template #header>Debug</template>
    <div class="target-handles">
      <Handle id="0:any" type="target" connectable="single" :position="Position.Left" data-name="Any" />
    </div>
  </NodeWrapper>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import NodeWrapper from "../NodeWrapper.vue";
</script>
