<script setup lang="ts">
import { useTemplate } from '~/composables/useTemplate'

const { t } = useTemplate()

const blocks = t('offer_blocks') as { label: string; text: string }[]
</script>

<template>
  <UPageSection class="bg-white" :ui="{ wrapper: 'py-12 sm:py-24' }">
    <UContainer>
      <div class="max-w-3xl mx-auto">
        <div class="flex flex-col items-center text-center mb-12">
          <span class="text-primary text-xs font-black uppercase tracking-widest block mb-4">
            🎁 Oferta especial
          </span>
          <h2 class="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            {{ t('offer_section_title') }}
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="block in blocks"
            :key="block.label"
            class="flex items-start gap-4 p-6 bg-secondary rounded-2xl border border-primary/5"
          >
            <UIcon
              name="i-heroicons-check-badge-20-solid"
              class="text-primary w-7 h-7 shrink-0 mt-0.5"
            />
            <div>
              <p class="font-black text-black text-lg uppercase tracking-wide mb-1">{{ block.label }}</p>
              <p class="text-black text-base leading-relaxed">{{ block.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </UPageSection>
</template>
