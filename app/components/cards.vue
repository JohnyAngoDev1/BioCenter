<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTemplate } from '~/composables/useTemplate'
import { useServices } from '~/composables/useServices'
import { useCart } from '~/composables/useCart'
import type { Service } from '~/interfaces/service.interface'

const props = defineProps<{
  limit?: number
  hideHeader?: boolean
}>()

const { t } = useTemplate()
const { servicesList, pending, error } = useServices()
const { addToCart } = useCart()
const toast = useToast()

const selectedCategory = ref('Todo')

const categories = t('categories')

const filteredServices = computed(() => {
  if (!servicesList.value) return []
  let list = servicesList.value

  if (selectedCategory.value !== 'Todo') {
    list = list.filter(item => item.category === selectedCategory.value)
  }

  if (props.limit) {
    return list.slice(0, props.limit)
  }

  return list
})

const openDetails = (item: Service) => {
  window.open(`/servicio/${item.slug}`, '_blank')
}

const handleAddToCart = (item: Service) => {
  addToCart(item)
  toast.add({
    title: '¡Producto añadido!',
    description: `${item.title} se ha agregado a tu carrito.`,
    icon: 'i-heroicons-check-circle',
    color: 'primary'
  })
}
</script>

<template>
  <UPageSection :ui="{ wrapper: props.hideHeader ? 'py-0 sm:py-0' : 'py-8 sm:py-16', container: props.hideHeader ? 'py-0 sm:py-0' : 'py-8 sm:py-16' }">
    <UContainer>
      <div v-if="!props.hideHeader" class="flex flex-col items-center text-center mb-12">
        <span class="text-primary text-xs font-black uppercase tracking-widest block mb-4">
          {{ t('cards_section_subtitle') }}
        </span>

        <h2 class="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">
          {{ t('cards_section_title') }}
        </h2>
      </div>

      <!-- Filtros de Categoría -->
      <div v-if="!props.limit" class="flex overflow-x-auto md:flex-wrap justify-start md:justify-center gap-2 mb-8 md:mb-12 pb-4 md:pb-0 no-scrollbar px-4 md:px-0">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          :class="[
            'px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap',
            selectedCategory === cat
              ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
              : 'bg-secondary text-gray-600 hover:bg-gray-200'
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex flex-wrap justify-center gap-8">
        <div v-for="n in (props.limit || 8)" :key="n" class="w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-2rem)] xl:w-[calc(25%-2rem)] max-w-[400px] h-[400px] bg-secondary animate-pulse rounded-4xl"></div>
      </div>

      <!-- Erors State -->
      <div v-else-if="error" class="text-center py-20">
        <p class="text-red-500 font-bold">{{ t('cards_section_error') }}</p>
      </div>

      <!-- Services Grid (Flat) -->
      <div v-else class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 place-items-center">
        <UPageCard
          v-for="item in filteredServices"
          :key="item.id"
          class="w-full max-w-[400px] rounded-4xl bg-secondary group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden flex flex-col h-full"
        >
          <template #header>
            <div class="relative overflow-hidden aspect-[3/4] cursor-pointer" @click="openDetails(item)">
              <NuxtImg
                :src="item.image"
                :alt="item.title"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                placeholder
              />
              <div class="absolute top-4 left-4">
                <span class="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-primary shadow-sm">
                  {{ item.badge || item.category }}
                </span>
              </div>
            </div>
          </template>

          <div class="flex flex-col gap-2 mt-4 px-2" @click="openDetails(item)">
            <h3 class="text-lg font-bold text-black leading-tight group-hover:text-primary transition-colors cursor-pointer">
              {{ item.title }}
            </h3>
            <p v-if="item.description" class="text-gray-500 text-xs line-clamp-2">
              {{ item.description }}
            </p>
            <p class="text-primary font-black text-xl mt-2">
              ${{ item.price.toFixed(2) }}
            </p>
          </div>

          <div class="flex items-center gap-2 mt-6 pt-4 border-t border-primary/5">
            <UButton
              block
              color="primary"
              variant="solid"
              class="flex-1 rounded-xl font-bold py-3 shadow-lg shadow-primary/20"
              @click="handleAddToCart(item)"
            >
              Añadir
              <template #trailing>
                <UIcon name="i-heroicons-shopping-cart-20-solid" />
              </template>
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-eye-20-solid"
              class="rounded-xl p-3"
              @click="openDetails(item)"
            />
          </div>
        </UPageCard>
      </div>

      <!-- Botón Ver Todos -->
      <div v-if="props.limit && !pending && !error" class="flex justify-center mt-12">
        <UButton
          to="/servicios"
          size="xl"
          class="rounded-full px-10 py-4 font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
        >
          {{ t('cards_section_view_all') }}
          <template #trailing>
            <UIcon name="i-heroicons-arrow-right-20-solid" />
          </template>
        </UButton>
      </div>


    </UContainer>
  </UPageSection>
</template>

<style scoped>
.rounded-4xl {
  border-radius: 2.5rem;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}
</style>