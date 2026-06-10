<script setup lang="ts">
import { useTemplate } from '~/composables/useTemplate'
import { useNavigation } from '~/composables/useNavigation'

const { t } = useTemplate()
const { navItems } = useNavigation()

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
                <!-- <UButton
                    color="primary"
                    variant="ghost"
                    icon="i-heroicons-shopping-cart-20-solid"
                    class="relative rounded-full p-2"
                    to="/checkout"
                >
                    <UBadge
                        v-if="cartCount > 0"
                        color="error"
                        size="xs"
                        class="absolute -top-1 -right-1 rounded-full px-1 min-w-[20px] h-[20px] flex items-center justify-center font-bold"
                    >
                        {{ cartCount }}
                    </UBadge>
                </UButton> -->

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
    </UHeader>
</template>
