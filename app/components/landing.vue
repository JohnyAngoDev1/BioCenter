<script setup lang="ts">
import { useTemplate } from '~/composables/useTemplate'

const { t } = useTemplate()
</script>

<template>
    <UPageSection class="bg-secondary relative overflow-hidden" :ui="{ wrapper: 'py-12 sm:py-24' }">
        <!-- Background decorative element -->
        <div class="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2"></div>
        
        <UContainer>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">

                <div class="flex flex-col justify-center gap-10 py-4 order-1 lg:order-1">

                    <div class="space-y-8">
                        <div class="space-y-4">
                            <span class="text-primary font-black uppercase tracking-[0.3em] text-xs">
                                {{ t('landing_hero_badge_text') }}
                            </span>
                            <h1 class="text-4xl sm:text-5xl lg:text-7xl font-black text-black tracking-tighter leading-[0.9] sm:leading-[0.85]">
                                {{ t('landing_hero_title_main') }}<br>
                                <span class="text-primary italic">{{ t('landing_hero_title_highlight') }}</span>
                            </h1>
                        </div>

                        <p class="text-gray-500 text-base sm:text-xl leading-relaxed max-w-lg">
                            {{ t('landing_hero_description') }}
                        </p>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-4 items-start">
                        <UButton :label="t('landing_secondary_button_text')" variant="solid"
                            class="rounded-full px-10 py-5 bg-primary text-white font-bold text-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-all"
                            to="#servicios" />
                        
                        <div class="flex items-center gap-4 py-2 px-4">
                            <div class="flex -space-x-3">
                                <div class="w-10 h-10 rounded-full bg-[#f1f5f9] border-2 border-white shadow-sm overflow-hidden">
                                    <NuxtImg src="/images/services/service-1.jpg" class="w-full h-full object-cover" />
                                </div>
                                <div class="w-10 h-10 rounded-full bg-[#F7F7F7] border-2 border-white shadow-sm overflow-hidden">
                                    <NuxtImg src="/images/services/service-2.jpg" class="w-full h-full object-cover" />
                                </div>
                                <div class="w-10 h-10 rounded-full bg-[#9E2C33] border-2 border-white shadow-sm overflow-hidden text-white flex items-center justify-center text-[10px] font-bold">
                                    +50
                                </div>
                            </div>
                            <p class="text-gray-500 text-xs font-bold uppercase tracking-wider">
                                {{ t('landing_trust_badge_text') }}
                            </p>
                        </div>
                    </div>

                </div>

                <div class="relative order-2 lg:order-2 flex justify-center">
                    <div class="absolute inset-0 max-w-md mx-auto bg-primary/10 rounded-[3rem] rotate-3 translate-x-4 translate-y-4"></div>
                    <NuxtImg :src="t('landing_hero_image_path')" class="relative z-10 w-full max-w-md h-auto rounded-[3rem] shadow-2xl border-4 border-white" />
                </div>
            </div>
        </UContainer>
    </UPageSection>
</template>