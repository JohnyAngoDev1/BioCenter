<script setup lang="ts">
import NavbarSrvCorp from '../components/navbar.vue';
import FooterSrvCorp from '../components/footer.vue';
import WspbuttonSrvCorp from '../components/wspbutton.vue';
</script>

<template>
  <div id="top">
    <WspbuttonSrvCorp />
    <NavbarSrvCorp />
    <slot />
    <div id="contacto">
      <FooterSrvCorp />
    </div>
  </div>
</template>
