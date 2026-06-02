<script setup lang="ts">
import { useCart } from '~/composables/useCart'
import { useTemplate } from '~/composables/useTemplate'
import type { Service } from '~/interfaces/service.interface'

const route = useRoute()
const router = useRouter()
const customUrl = route.params.customUrl as string

const { data: producto, pending } = await useAsyncData(`by-url-${customUrl}`, () =>
  $fetch<Service>(`/api/productos/url/${encodeURIComponent(customUrl)}`).catch(() => null)
)

if (!producto.value) {
  throw createError({ statusCode: 404, statusMessage: 'Página no encontrada' })
}

const { addToCart } = useCart()
const toast = useToast()
const { t } = useTemplate()

const handleAddToCart = () => {
  if (!producto.value) return
  if (producto.value.isApplyPay === false) {
    const phoneNumber = t('wspbutton_phone_number')
    const message = `Hola, estoy interesado en agendar el servicio: ${producto.value.title}`
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
    return
  }
  addToCart(producto.value)
  toast.add({
    title: '¡Producto añadido!',
    description: `${producto.value.title} se ha agregado a tu carrito.`,
    icon: 'i-heroicons-check-circle',
    color: 'primary'
  })
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

    <!-- Skeleton -->
    <div v-if="pending" class="animate-pulse">
      <div class="w-full h-80 bg-gray-200"></div>
      <div class="max-w-3xl mx-auto px-5 py-6 space-y-4">
        <div class="h-4 bg-gray-200 w-1/4 rounded"></div>
        <div class="h-8 bg-gray-200 w-3/4 rounded"></div>
        <div class="h-10 bg-gray-200 w-1/3 rounded"></div>
        <div class="h-24 bg-gray-200 w-full rounded mt-4"></div>
      </div>
    </div>

    <template v-else-if="producto">
      <!-- Imagen 1: full bleed, altura natural -->
      <div class="w-full md:max-w-4xl md:mx-auto">
        <NuxtImg :src="producto.image?.[0]" class="w-full h-auto block" />
      </div>

      <!-- Info del producto -->
      <div class="max-w-3xl mx-auto px-5 py-8">
        <span class="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">
          {{ producto.category }}
        </span>
        <h1 class="text-3xl md:text-5xl font-black text-black leading-tight mb-3">
          {{ producto.title }}
        </h1>
        <p class="text-primary font-black text-3xl md:text-4xl mb-5">
          ${{ Number(producto.price).toFixed(2) }}
        </p>

        <div class="space-y-5 text-gray-600 mb-6">
          <p class="leading-relaxed text-base md:text-lg">
            {{ producto.longDescription || producto.description }}
          </p>

          <div v-if="producto.features?.length" class="pt-4 border-t border-gray-100">
            <h4 class="font-bold text-black mb-4 uppercase text-xs tracking-widest block">Incluye:</h4>
            <ul class="space-y-3">
              <li v-for="feat in producto.features" :key="feat" class="flex items-start gap-3 text-base">
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
            @click="handleAddToCart"
          >
            {{ producto.isApplyPay !== false ? 'Comprar ahora' : 'Solicitar información' }}
            <template #trailing>
              <UIcon :name="producto.isApplyPay !== false ? 'i-heroicons-shopping-cart-20-solid' : 'i-simple-icons-whatsapp'" />
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

      <!-- Imágenes 2, 3, 4... full bleed -->
      <template v-if="producto.image?.length > 1">
        <div
          v-for="(img, i) in producto.image.slice(1)"
          :key="i"
          class="w-full md:max-w-4xl md:mx-auto"
        >
          <NuxtImg :src="img" class="w-full h-auto block" />
        </div>
      </template>
    </template>

  </div>
</template>
