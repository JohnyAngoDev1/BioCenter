<script setup lang="ts">
import { useCart } from '~/composables/useCart'
import { useTemplate } from '~/composables/useTemplate'

const route = useRoute()
const router = useRouter()
const customUrl = route.params.customUrl as string

const { data: producto, pending, error } = await useAsyncData(`by-url-${customUrl}`, () =>
  $fetch<any>(`/api/productos/url/${encodeURIComponent(customUrl)}`).catch(() => null)
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
  <div class="py-10 md:py-1 tracking-tight relative overflow-hidden bg-white">
    <UContainer>
      <div v-if="pending" class="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto animate-pulse">
        <div class="w-full md:w-1/2 h-64 md:h-[500px] bg-gray-200 rounded-3xl"></div>
        <div class="w-full md:w-1/2 space-y-4 py-8">
          <div class="h-4 bg-gray-200 w-1/4 rounded"></div>
          <div class="h-8 bg-gray-200 w-3/4 rounded"></div>
          <div class="h-10 bg-gray-200 w-1/3 rounded"></div>
          <div class="h-24 bg-gray-200 w-full rounded mt-8"></div>
        </div>
      </div>

      <div v-else-if="producto" class="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-16 items-center">
        <div class="w-full md:w-1/2 h-64 sm:h-96 md:h-[550px] shrink-0 relative bg-secondary rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
          <NuxtImg :src="producto.image" class="w-full h-full object-cover absolute inset-0" />
        </div>

        <div class="w-full md:w-1/2 flex flex-col md:py-4 lg:py-8">
          <div class="mb-6 lg:mb-8">
            <span class="text-primary text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-3 block">
              {{ producto.category }}
            </span>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-black leading-tight mb-4">
              {{ producto.title }}
            </h1>
            <p class="text-primary font-black text-3xl sm:text-4xl mb-6">
              ${{ Number(producto.price).toFixed(2) }}
            </p>

            <div class="space-y-6 text-gray-600">
              <p class="leading-relaxed text-base sm:text-lg">
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
      </div>
    </UContainer>
  </div>
</template>
