<script setup lang="ts">
import { useTemplate } from '~/composables/useTemplate'

const { t } = useTemplate()

const benefits = t('benefits_list') as { title: string; description: string }[]
</script>

<template>
  <UPageSection class="bg-white" :ui="{ wrapper: 'py-12 sm:py-24' }">
    <UContainer>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        <!-- Imagen -->
        <div class="relative flex justify-center order-2 lg:order-1">
          <div class="absolute inset-0 max-w-md mx-auto bg-primary/10 rounded-[3rem] -rotate-3 -translate-x-4 translate-y-4"></div>
          <NuxtImg
            :src="t('benefits_section_image')"
            class="relative z-10 w-full max-w-md h-auto rounded-[3rem] shadow-2xl border-4 border-white object-cover"
          />
        </div>

        <!-- Contenido -->
        <div class="flex flex-col gap-8 order-1 lg:order-2">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            <span class="text-black">{{ t('benefits_section_title') }}</span>
            <br>
            <span class="text-primary italic">{{ t('benefits_section_title_highlight') }}</span>
          </h2>

          <div class="space-y-1">
            <p class="text-primary font-black uppercase tracking-[0.2em] text-xs mb-4">✦ Beneficios:</p>
            <ul class="space-y-4">
              <li
                v-for="benefit in benefits"
                :key="benefit.title"
                class="flex items-start gap-3"
              >
                <UIcon
                  name="i-heroicons-check-circle-20-solid"
                  class="text-primary w-6 h-6 shrink-0 mt-0.5"
                />
                <div>
                  <p class="font-bold text-black text-lg">{{ benefit.title }}</p>
                  <p v-if="benefit.description" class="text-black text-lg leading-relaxed mt-0.5">
                    {{ benefit.description }}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </UContainer>
  </UPageSection>
</template>
