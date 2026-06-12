<script setup lang="ts">
import { useTemplate } from '~/composables/useTemplate'

const { t } = useTemplate()

const whatsappUrl = computed(() =>
  `https://wa.me/${t('wspbutton_phone_number')}?text=${encodeURIComponent('Hola, quiero mi evaluación médica gratuita en Biocenter')}`
)
</script>

<template>
  <UPageSection class="bg-secondary" :ui="{ wrapper: 'py-16 sm:py-28' }">
    <UContainer>
      <div class="max-w-2xl mx-auto flex flex-col items-center text-center gap-6">

        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          <span class="text-black">{{ t('cta_title') }}</span>
          <br>
          <span class="text-primary italic">{{ t('cta_title_highlight') }}</span>
        </h2>

        <p class="text-black text-base sm:text-lg leading-relaxed">
          {{ t('cta_description') }}
        </p>

        <UButton
          :to="whatsappUrl"
          target="_blank"
          size="xl"
          color="primary"
          variant="solid"
          class="rounded-full px-10 py-5 font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-transform mt-2"
        >
          <template #leading>
            <UIcon name="i-simple-icons-whatsapp" />
          </template>
          {{ t('cta_button_text') }}
        </UButton>

        <span class="text-black/70 text-base font-bold uppercase tracking-widest mt-2">
          {{ t('cta_badge_text') }}
        </span>

      </div>
    </UContainer>
  </UPageSection>
</template>
