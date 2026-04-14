<script setup lang="ts">
import { useTemplate } from '~/composables/useTemplate';
import { useNavigation } from '~/composables/useNavigation';

const { t } = useTemplate()
const { footerLinks } = useNavigation()
</script>

<template>
  <footer class="bg-secondary/30 pt-16 pb-12 border-t border-gray-100">
    <UContainer class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
      <!-- Columna 1: Marca -->
      <section class="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
        <div class="flex items-center gap-4">
          <div v-if="t('navbar_brand_icon').startsWith('/') || t('navbar_brand_icon').includes('.')" class="flex items-center justify-center p-2 rounded shadow-sm border border-gray-50">
            <NuxtImg :src="t('navbar_brand_icon')" class="h-10 w-auto object-contain" />
          </div>
          <div v-else class="p-2 rounded-lg flex items-center justify-center">
            <UIcon :name="t('navbar_brand_icon')" class="text-white text-2xl" />
          </div>
          <span class="font-bold text-slate-900 text-lg sm:text-xl leading-tight uppercase tracking-tight max-w-[150px]">
            {{ t('navbar_brand_name') }}
          </span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed max-w-xs">
          {{ t('footer_company_description') }}
        </p>
      </section>

      <!-- Columna 2: Servicios -->
      <nav class="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
        <h3 class="font-bold text-black uppercase text-xs tracking-widest">{{ t('footer_nav_column_1_title') }}</h3>
        <div class="flex flex-col gap-4">
          <ULink
            v-for="link in footerLinks.experience"
            :key="link.label"
            :to="link.to"
            class="text-gray-400 hover:text-primary text-sm font-medium transition-colors"
          >
            {{ link.label }}
          </ULink>
        </div>
      </nav>

      <!-- Columna 3: Contacto -->
      <section class="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
        <h3 class="font-bold text-black uppercase text-xs tracking-widest">{{ t('footer_nav_column_2_title') }}</h3>
        <div class="flex flex-col gap-4">
          <a :href="'tel:' + t('contactus_info_phone').replace(/\s+/g, '')" class="text-gray-400 hover:text-primary text-sm font-medium transition-colors">
            {{ t('contactus_info_phone') }}
          </a>
          <a :href="'mailto:' + t('contactus_info_email')" class="text-gray-400 hover:text-primary text-sm font-medium transition-colors truncate">
            {{ t('contactus_info_email') }}
          </a>
        </div>
      </section>

      <!-- Columna 4: Horario -->
      <section class="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
        <h3 class="font-bold text-black uppercase text-xs tracking-widest">{{ t('footer_nav_column_3_title') }}</h3>
        <div class="flex flex-col gap-1">
          <span class="font-bold text-slate-700 text-sm">{{ t('footer_horario_disponibilidad') }}</span>
          <span class="text-gray-400 text-sm font-medium leading-relaxed">
            {{ t('footer_horario_detalle') }}
          </span>
        </div>
      </section>
    </UContainer>

    <!-- Bottom Bar (Opcional, pero recomendado para copyright) -->
    <UContainer class="mt-16 pt-8 border-t border-gray-100/50">
      <p class="text-[10px] text-center font-bold text-gray-400 tracking-[0.2em] uppercase">
        © {{ new Date().getFullYear() }} {{ t('footer_copyright_text') }}
      </p>
    </UContainer>
  </footer>
</template>