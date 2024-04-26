<script lang="ts" setup>
import { Background } from '@vue-flow/background'
</script>

<template>
  <div style="height: 100%; width: 100%">
    <Background>
      <slot />
    </Background>
  </div>
</template>
