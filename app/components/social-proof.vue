<script setup lang="ts">
import { useTemplate } from '~/composables/useTemplate'

const { t } = useTemplate()

const blocks = t('social_proof_blocks') as { label: string; text: string }[]
</script>

<template>
  <UPageSection class="bg-secondary" :ui="{ wrapper: 'py-12 sm:py-24' }">
    <UContainer>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        <!-- Contenido -->
        <div class="flex flex-col gap-8 order-1">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            <span class="text-black">{{ t('social_proof_section_title') }}</span>
            <br>
            <span class="text-primary italic">{{ t('social_proof_section_title_highlight') }}</span>
          </h2>

          <div class="space-y-6">
            <div
              v-for="block in blocks"
              :key="block.label"
              class="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-primary/5"
            >
              <UIcon
                name="i-heroicons-check-badge-20-solid"
                class="text-primary w-7 h-7 shrink-0 mt-0.5"
              />
              <div>
                <p class="font-black text-black text-lg uppercase tracking-wide mb-1">{{ block.label }}</p>
                <p class="text-black text-lg leading-relaxed">{{ block.text }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Imagen -->
        <div class="relative flex justify-center order-2">
          <div class="absolute inset-0 max-w-md mx-auto bg-primary/10 rounded-[3rem] rotate-3 translate-x-4 translate-y-4"></div>
          <NuxtImg
            :src="t('social_proof_section_image')"
            class="relative z-10 w-full max-w-md h-auto rounded-[3rem] shadow-2xl border-4 border-white object-cover"
          />
        </div>

      </div>
    </UContainer>
  </UPageSection>
</template>
