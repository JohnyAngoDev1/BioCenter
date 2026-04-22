<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from '#app'
import { useServices } from '~/composables/useServices'
import { useCart } from '~/composables/useCart'

const route = useRoute()
const router = useRouter()
const { servicesList, pending, error } = useServices()
const { addToCart } = useCart()
const toast = useToast()

const serviceSlug = String(route.params.slug)
const selectedService = computed(() => {
  if (!servicesList.value) return null
  return servicesList.value.find(s => s.slug === serviceSlug) || null
})

const recommendedServices = computed(() => {
  if (!servicesList.value || !selectedService.value) return []
  return servicesList.value
    .filter(s => s.category === selectedService.value!.category && s.slug !== serviceSlug)
    .slice(0, 3)
})

const openRecommended = (slug: string) => {
  navigateTo(`/servicio/${slug}`)
}

const handleAddToCart = () => {
  if (selectedService.value) {
    addToCart(selectedService.value)
    toast.add({
      title: '¡Producto añadido!',
      description: `${selectedService.value.title} se ha agregado a tu carrito.`,
      icon: 'i-heroicons-check-circle',
      color: 'primary'
    })
  }
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/')
  }
}
</script>

<template>
  <div class="py-10 md:py-1 tracking-tight relative overflow-hidden bg-white">
    <UContainer>
      <!-- Loading State -->
      <div v-if="pending" class="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto animate-pulse">
        <div class="w-full md:w-1/2 h-64 md:h-[500px] bg-gray-200 rounded-3xl"></div>
        <div class="w-full md:w-1/2 space-y-4 py-8">
          <div class="h-4 bg-gray-200 w-1/4 rounded"></div>
          <div class="h-8 bg-gray-200 w-3/4 rounded"></div>
          <div class="h-10 bg-gray-200 w-1/3 rounded"></div>
          <div class="h-24 bg-gray-200 w-full rounded mt-8"></div>
        </div>
      </div>

      <!-- Error / Not Found State -->
      <div v-else-if="error || (!selectedService && !pending)" class="text-center py-20">
        <UIcon name="i-heroicons-exclamation-triangle" class="text-6xl text-gray-400 mb-4" />
        <h2 class="text-3xl font-black text-gray-900 mb-4">Servicio no encontrado</h2>
        <UButton
          size="lg"
          variant="soft"
          class="rounded-full px-8"
          @click="goBack"
        >
          Volver al Catálogo
        </UButton>
      </div>

      <!-- Service Details -->
      <div v-else-if="selectedService" class="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-16 items-center">
        <!-- Side: Image -->
        <div class="w-full md:w-1/2 h-64 sm:h-96 md:h-[550px] shrink-0 relative bg-secondary rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
          <NuxtImg :src="selectedService.image" class="w-full h-full object-cover absolute inset-0" />
        </div>

        <!-- Side: Info -->
        <div class="w-full md:w-1/2 flex flex-col md:py-4 lg:py-8">
          <div class="mb-6 lg:mb-8">
            <span class="text-primary text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-3 block">
              {{ selectedService.category }}
            </span>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-black leading-tight mb-4">
              {{ selectedService.title }}
            </h1>
            <p class="text-primary font-black text-3xl sm:text-4xl mb-6">
              ${{ selectedService.price.toFixed(2) }}
            </p>

            <div class="space-y-6 text-gray-600">
              <p class="leading-relaxed text-base sm:text-lg">
                {{ selectedService.longDescription || selectedService.description }}
              </p>

              <div v-if="selectedService.features && selectedService.features.length" class="pt-4 border-t border-gray-100">
                <h4 class="font-bold text-black mb-4 uppercase text-xs tracking-widest block">Incluye:</h4>
                <ul class="space-y-3">
                  <li v-for="feat in selectedService.features" :key="feat" class="flex items-start gap-3 text-base">
                    <UIcon name="i-heroicons-check-circle-20-solid" class="text-primary w-6 h-6 shrink-0" />
                    <span class="mt-px">{{ feat }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="mt-auto pt-8 flex flex-col gap-4">
            <UButton
              block
              size="xl"
              color="primary"
              variant="solid"
              class="rounded-2xl py-4 font-black shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform"
              @click="handleAddToCart"
            >
              Añadir al Carrito
              <template #trailing>
                <UIcon name="i-heroicons-shopping-cart-20-solid" />
              </template>
            </UButton>
            
            <UButton
              block
              variant="ghost"
              class="rounded-xl py-3 font-bold hover:bg-gray-50"
              @click="goBack"
            >
              <template #leading>
                <UIcon name="i-heroicons-arrow-left-20-solid" />
              </template>
              Volver Atrás
            </UButton>
          </div>
        </div>
      </div>

      <!-- Recommended Products -->
      <div v-if="selectedService && recommendedServices.length" class="max-w-5xl mx-auto mt-20">
        <h3 class="text-2xl font-black mb-8 text-center sm:text-left">Productos Recomendados</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <UPageCard
            v-for="item in recommendedServices"
            :key="item.id"
            class="w-full rounded-3xl bg-secondary group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden cursor-pointer flex flex-col h-full"
            @click="openRecommended(item.slug || '')"
          >
            <template #header>
              <div class="relative overflow-hidden aspect-[4/3]">
                <NuxtImg
                  :src="item.image"
                  :alt="item.title"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </template>
            <div class="p-4 flex flex-col flex-grow">
              <h4 class="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                {{ item.title }}
              </h4>
              <p class="text-primary font-black mt-2">
                ${{ item.price.toFixed(2) }}
              </p>
            </div>
          </UPageCard>
        </div>
      </div>
    </UContainer>
  </div>
</template>
