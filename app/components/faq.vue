<script setup lang="ts">
import { useTemplate } from '~/composables/useTemplate'

const { t } = useTemplate()

const faqList = t('faq_list') as { question: string; answer: string }[]

const items = faqList.map(item => ({
  label: item.question,
  content: item.answer
}))
</script>

<template>
  <UPageSection class="bg-secondary" :ui="{ wrapper: 'py-12 sm:py-24' }">
    <UContainer>
      <div class="max-w-2xl mx-auto">
        <div class="flex flex-col items-center text-center mb-12">
          <span class="text-primary text-lg font-black uppercase tracking-widest block mb-4">
            ❓ FAQ
          </span>
          <h2 class="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            {{ t('faq_section_title') }}
          </h2>
        </div>

        <UAccordion
          :items="items"
          :ui="{
            item: 'border border-primary/10 rounded-2xl mb-3 overflow-hidden bg-white',
            label: 'font-bold text-black text-base py-4 px-5',
            content: 'text-black text-base leading-relaxed px-5 pb-5'
          }"
        />
      </div>
    </UContainer>
  </UPageSection>
</template>
