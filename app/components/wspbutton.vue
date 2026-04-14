<script setup lang="ts">
import { computed } from 'vue'
import { useTemplate } from '~/composables/useTemplate'

const { t } = useTemplate()

const wspUrl = computed(() => `https://wa.me/${t('wspbutton_phone_number')}`)
</script>

<template>
  <div class="fixed bottom-8 right-8 z-[100] group">
    <span
      class="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-black text-xs font-black tracking-widest uppercase py-2 px-4 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-gray-100 whitespace-nowrap">
      {{ t('wspbutton_tooltip_text') }}
    </span>

    <UButton icon="i-simple-icons-whatsapp" size="xl" variant="solid"
      class="rounded-2xl p-4 shadow-2xl shadow-green-500/40 hover:scale-110 active:scale-95 transition-all duration-300 bg-[#25D366] hover:bg-[#20ba5a]"
      :to="wspUrl" target="_blank" />
  </div>
</template>
