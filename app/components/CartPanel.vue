<script setup lang="ts">
import { useCart } from '~/composables/useCart'
import { useTemplate } from '~/composables/useTemplate'

const { t } = useTemplate()
const { cart, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart()

const handleCheckout = () => {
  const phone = t('wspbutton_phone_number')
  let message = `*Nuevo Pedido - Biocenter*\n\n`

  cart.value.forEach(item => {
    message += `• ${item.title} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}\n`
  })

  message += `\n*Total a Pagar: $${cartTotal.value.toFixed(2)}*`

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
}
</script>

<template>
  <div class="flex flex-col h-full bg-white rounded-3xl border border-black/5 shadow-xl overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-5 border-b border-black/5 shrink-0">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-shopping-bag-20-solid" class="text-primary text-2xl shrink-0" />
        <h3 class="text-lg font-black text-black tracking-tight leading-none">
          Mi Carrito
        </h3>
        <UBadge v-if="cartCount > 0" color="primary" size="xs" class="rounded-full px-2 ml-auto">
          {{ cartCount }}
        </UBadge>
      </div>
    </div>

    <!-- Items -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      <div
        v-if="cart.length === 0"
        class="h-full flex flex-col items-center justify-center text-center p-8 gap-4"
      >
        <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <UIcon name="i-heroicons-shopping-cart-20-solid" class="text-gray-300 text-3xl" />
        </div>
        <p class="text-gray-400 font-bold text-sm italic">Tu carrito está vacío</p>
      </div>

      <div
        v-for="item in cart"
        :key="item.id"
        class="bg-secondary rounded-2xl p-3 flex gap-3 group transition-all"
      >
        <div class="w-16 h-16 rounded-xl overflow-hidden shrink-0">
          <NuxtImg :src="item.image" class="w-full h-full object-cover" />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-1 mb-1">
            <h4 class="font-bold text-black text-xs leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {{ item.title }}
            </h4>
            <UButton
              size="xs"
              color="red"
              variant="ghost"
              icon="i-heroicons-trash-20-solid"
              class="rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              @click="removeFromCart(item.id)"
            />
          </div>
          <p class="text-primary font-black text-sm mb-2">${{ item.price.toFixed(2) }}</p>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1 bg-white rounded-lg p-0.5">
              <UButton
                size="xs"
                color="gray"
                variant="ghost"
                icon="i-heroicons-minus-20-solid"
                class="rounded-md"
                @click="updateQuantity(item.id, -1)"
              />
              <span class="text-xs font-black min-w-[20px] text-center">{{ item.quantity }}</span>
              <UButton
                size="xs"
                color="gray"
                variant="ghost"
                icon="i-heroicons-plus-20-solid"
                class="rounded-md"
                @click="updateQuantity(item.id, 1)"
              />
            </div>
            <span class="text-xs font-bold text-gray-500">
              ${{ (item.price * item.quantity).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="cart.length > 0" class="p-4 border-t border-black/5 space-y-3 shrink-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div class="flex items-center justify-between px-1">
        <span class="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Total Estimado</span>
        <span class="text-xl font-black text-black">${{ cartTotal.toFixed(2) }}</span>
      </div>

      <UButton
        block
        size="lg"
        color="primary"
        class="rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
        @click="handleCheckout"
      >
        Completar Pedido
        <template #trailing>
          <UIcon name="i-heroicons-paper-plane-20-solid" />
        </template>
      </UButton>

      <UButton
        block
        variant="ghost"
        color="gray"
        class="rounded-xl font-bold text-sm"
        @click="clearCart"
      >
        Vaciar Carrito
      </UButton>

      <p class="text-[10px] text-center text-gray-400">
        Será redirigido a WhatsApp para coordinar el pago.
      </p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
