<script setup lang="ts">
import LandingSrvCorp from '../components/landing.vue';
import CardsSrvCorp from '../components/cards.vue';
</script>

<template>
  <div>
    <LandingSrvCorp />
    <div id="servicios">
      <CardsSrvCorp :limit="4" />
    </div>
  </div>
</template>
