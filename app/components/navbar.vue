<script setup lang="ts">
import { ref } from 'vue'
import { useTemplate } from '~/composables/useTemplate'
import { useNavigation } from '~/composables/useNavigation'
import { useCart } from '~/composables/useCart'

const { t } = useTemplate()
const { navItems } = useNavigation()
const { cart, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart()

const isCartOpen = ref(false)

const handleCheckout = () => {
  isCartOpen.value = false
  navigateTo('/checkout')
}
</script>

<template>
    <UHeader>
        <template #left>
            <NuxtLink to="/" class="flex items-center gap-3">
                <div v-if="t('navbar_brand_icon').startsWith('/') || t('navbar_brand_icon').includes('.')" class="flex items-center justify-center">
                    <NuxtImg :src="t('navbar_brand_icon')" class="h-10 w-auto object-contain" />
                </div>
                <div v-else class="p-1 rounded-lg flex items-center justify-center">
                    <UIcon :name="t('navbar_brand_icon')" class="text-2xl text-white" />
                </div>
                <span class="font-bold text-2xl text-black">
                    {{ t('navbar_brand_name') }}
                </span>
            </NuxtLink>
        </template>

        <UNavigationMenu :items="navItems" variant="link" color="primary" class="hidden lg:flex" :ui="{
            link: 'text-black font-bold'
        }" />

        <template #right>
            <div class="flex items-center gap-4">
                <UButton
                    color="primary"
                    variant="ghost"
                    icon="i-heroicons-shopping-cart-20-solid"
                    class="relative rounded-full p-2"
                    @click="isCartOpen = true"
                >
                    <UBadge
                        v-if="cartCount > 0"
                        color="primary"
                        size="xs"
                        class="absolute -top-1 -right-1 rounded-full px-1 min-w-[20px] h-[20px] flex items-center justify-center font-bold"
                    >
                        {{ cartCount }}
                    </UBadge>
                </UButton>

                <UButton
                    v-if="t('navbar_cta_button_text')"
                    color="primary"
                    class="rounded-full px-6 py-2 font-bold hidden sm:flex"
                    to="#contacto"
                >
                    {{ t('navbar_cta_button_text') }}
                </UButton>
            </div>
        </template>

        <template #body>
            <div class="p-4 space-y-6">
                <UNavigationMenu :items="navItems" orientation="vertical" color="primary" :ui="{
                    link: 'text-black'
                }" />
            </div>
        </template>
    </UHeader>    <!-- Shopping Cart Slideover (Right Side) -->
    <ClientOnly>
      <USlideover v-model:open="isCartOpen" side="right" :ui="{ content: 'max-w-md' }">
        <template #title>
            <div class="flex items-center gap-3 py-2">
                <UIcon name="i-heroicons-shopping-bag-20-solid" class="text-primary text-2xl" />
                <h3 class="text-xl font-black text-black tracking-tight">Mi Carrito ({{ cartCount }})</h3>
            </div>
        </template>

        <template #body>
          <div class="flex flex-col h-full bg-secondary/30">
            <!-- Cart Items List -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
                <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-center p-8">
                    <div class="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <UIcon name="i-heroicons-shopping-cart-20-solid" class="text-gray-300 text-4xl" />
                    </div>
                    <p class="text-gray-500 font-bold italic">Tu carrito está vacío</p>
                </div>

                <div v-for="item in cart" :key="item.id" class="bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex gap-4 group transition-all">
                    <div class="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                        <NuxtImg :src="item.image" class="w-full h-full object-cover" />
                    </div>

                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-black text-sm truncate mb-1 group-hover:text-primary">{{ item.title }}</h4>
                        <p class="text-primary font-black text-sm mb-3">${{ item.price.toFixed(2) }}</p>

                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 bg-secondary rounded-lg p-1">
                                <UButton
                                    size="xs"
                                    color="neutral"
                                    variant="ghost"
                                    icon="i-heroicons-minus-20-solid"
                                    class="rounded-md"
                                    @click="updateQuantity(item.id, -1)"
                                />
                                <span class="text-xs font-black min-w-[20px] text-center">{{ item.quantity }}</span>
                                <UButton
                                    size="xs"
                                    color="neutral"
                                    variant="ghost"
                                    icon="i-heroicons-plus-20-solid"
                                    class="rounded-md"
                                    @click="updateQuantity(item.id, 1)"
                                />
                            </div>
                            <UButton
                                size="xs"
                                color="error"
                                variant="ghost"
                                icon="i-heroicons-trash-20-solid"
                                class="rounded-lg opacity-40 group-hover:opacity-100 transition-opacity"
                                @click="removeFromCart(item.id)"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cart Footer -->
            <div v-if="cart.length > 0" class="bg-white p-6 border-t border-black/5 space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div class="flex items-center justify-between px-2">
                    <span class="text-gray-500 font-bold uppercase text-xs tracking-widest">Total Estimado</span>
                    <span class="text-2xl font-black text-black leading-none">${{ cartTotal.toFixed(2) }}</span>
                </div>

                <div class="grid grid-cols-1 gap-3">
                    <UButton
                        block
                        size="xl"
                        color="primary"
                        class="rounded-2xl py-5 font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
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
                        color="neutral"
                        class="rounded-xl font-bold py-2"
                        @click="clearCart"
                    >
                        Vaciar Carrito
                    </UButton>
                </div>
                <p class="text-[10px] text-center text-gray-400 font-medium">
                    Será redirigido a un punto de pago y formulario seguro.
                </p>
            </div>
          </div>
        </template>
      </USlideover>
    </ClientOnly>
</template>