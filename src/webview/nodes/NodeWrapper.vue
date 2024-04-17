<template>
  <div class="rounded-md shadow-lg bg-gray-900">
    <div class="p-2 bg-gray-700 rounded-t-md">
      <h3>
        <slot name="header" />
      </h3>
    </div>
    <div class="p-4 rounded-b-md">
      <slot name="body" />
    </div>
    <slot></slot>
  </div>
</template>
