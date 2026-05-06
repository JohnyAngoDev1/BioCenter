<script setup lang="ts">
onMounted(() => {
  // Redirigir al checkout para mostrar el mensaje de error y el botón de reintento
  navigateTo('/checkout?status=cancel')
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <UIcon name="i-heroicons-arrow-path-20-solid" class="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
      <p class="text-gray-600 font-medium">Procesando cancelación...</p>
    </div>
  </div>
</template>
