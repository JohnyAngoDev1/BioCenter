<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from '#app'
import { useServices } from '~/composables/useServices'
import { useCart } from '~/composables/useCart'
import { useTemplate } from '~/composables/useTemplate'

const route = useRoute()
const router = useRouter()
const { servicesList, pending, error } = useServices()
const { addToCart, clearCart } = useCart()
const { t } = useTemplate()

const { data: buttonConfig } = await useFetch('/api/config/button', { getCachedData: () => undefined })
const buttonColor = computed(() => (buttonConfig.value as any)?.buy_button_color || '#269144')

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
    // Redirigir a WhatsApp si no requiere pago online
    if (selectedService.value.isApplyPay === false) {
      const phoneNumber = t('wspbutton_phone_number')
      const message = `Hola, estoy interesado en agendar el servicio: ${selectedService.value.title}`
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
      return
    }

    clearCart()
    addToCart(selectedService.value)
    navigateTo('/checkout')
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
  <div class="tracking-tight relative bg-white">

    <!-- Error / Not Found State -->
    <div v-if="error || (!selectedService && !pending)" class="text-center py-20">
      <UIcon name="i-heroicons-exclamation-triangle" class="text-6xl text-gray-400 mb-4" />
      <h2 class="text-3xl font-black text-gray-900 mb-4">Servicio no encontrado</h2>
      <UButton size="lg" variant="soft" class="rounded-full px-8" @click="goBack">
        Volver al Catálogo
      </UButton>
    </div>

    <!-- Skeleton -->
    <div v-else-if="pending" class="animate-pulse">
      <div class="w-full h-80 bg-gray-200"></div>
      <div class="max-w-3xl mx-auto px-5 py-6 space-y-4">
        <div class="h-4 bg-gray-200 w-1/4 rounded"></div>
        <div class="h-8 bg-gray-200 w-3/4 rounded"></div>
        <div class="h-10 bg-gray-200 w-1/3 rounded"></div>
        <div class="h-24 bg-gray-200 w-full rounded mt-4"></div>
      </div>
    </div>

    <template v-else-if="selectedService">
      <!-- Carrusel (mobile y desktop) -->
      <div class="max-w-3xl mx-auto px-5 pt-6">
        <ProductImageCarousel :images="selectedService.image || []" />
      </div>

      <!-- Info del producto -->
      <div class="max-w-3xl mx-auto px-5 py-8">
        <span class="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">
          {{ selectedService.category }}
        </span>
        <h1 class="text-3xl md:text-5xl font-black text-black leading-tight mb-3">
          {{ selectedService.title }}
        </h1>
        <p class="text-primary font-black text-3xl md:text-4xl mb-5">
          ${{ selectedService.price.toFixed(2) }}
        </p>

        <div class="space-y-5 text-gray-600 mb-6">
          <p class="leading-relaxed text-base md:text-lg">
            {{ selectedService.longDescription || selectedService.description }}
          </p>

          <div v-if="selectedService.features?.length" class="pt-4 border-t border-gray-100">
            <h4 class="font-bold text-black mb-4 uppercase text-xs tracking-widest block">Incluye:</h4>
            <ul class="space-y-3">
              <li v-for="feat in selectedService.features" :key="feat" class="flex items-start gap-3 text-base">
                <UIcon name="i-heroicons-check-circle-20-solid" class="text-primary w-6 h-6 shrink-0" />
                <span class="mt-px">{{ feat }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <UButton
            block
            size="xl"
            color="primary"
            variant="solid"
            class="rounded-2xl py-4 font-black shadow-xl shadow-primary/20"
            :style="{ backgroundColor: buttonColor, boxShadow: `0 10px 30px ${buttonColor}40` }"
            @click="handleAddToCart"
          >
            {{ selectedService.isApplyPay !== false ? 'Comprar ahora' : 'Solicitar información' }}
            <template #trailing>
              <UIcon :name="selectedService.isApplyPay !== false ? 'i-heroicons-shopping-cart-20-solid' : 'i-simple-icons-whatsapp'" />
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

      <!-- Imágenes full bleed (todas) -->
      <template v-if="selectedService.image?.length">
        <div
          v-for="(img, i) in selectedService.image"
          :key="i"
          class="w-full"
        >
          <NuxtImg :src="img" class="w-full h-auto block" />
        </div>
      </template>

      <!-- Botón comprar al final de las imágenes verticales -->
      <div class="max-w-3xl mx-auto px-5 pt-10 pb-10 flex flex-col gap-3">
        <UButton
          block
          size="xl"
          color="primary"
          variant="solid"
          class="rounded-2xl py-4 font-black shadow-xl shadow-primary/20"
          :style="{ backgroundColor: buttonColor, boxShadow: `0 10px 30px ${buttonColor}40` }"
          @click="handleAddToCart"
        >
          {{ selectedService.isApplyPay !== false ? 'Comprar ahora' : 'Solicitar información' }}
          <template #trailing>
            <UIcon :name="selectedService.isApplyPay !== false ? 'i-heroicons-shopping-cart-20-solid' : 'i-simple-icons-whatsapp'" />
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

      <!-- Productos Recomendados -->
      <div v-if="recommendedServices.length" class="max-w-5xl mx-auto px-5 mt-16 pb-12">
        <h3 class="text-2xl font-black mb-8">Productos Recomendados</h3>
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
                  :src="item.image?.[0]"
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
    </template>

  </div>
</template>
