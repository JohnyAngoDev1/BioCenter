<script setup lang="ts">
const props = defineProps<{
  images: string[];
}>();

const activeIndex = ref(0);

const activeImage = computed(() => props.images[activeIndex.value] ?? props.images[0]);

watch(() => props.images, () => { activeIndex.value = 0; });

function prev() {
  activeIndex.value = (activeIndex.value - 1 + props.images.length) % props.images.length;
}

function next() {
  activeIndex.value = (activeIndex.value + 1) % props.images.length;
}
</script>

<template>
  <div class="flex flex-col gap-3 w-full">

    <!-- Carrusel (mobile y desktop) -->
    <div class="flex flex-col gap-3 w-full">
      <!-- Imagen principal -->
      <div class="relative w-full bg-secondary rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
        <Transition name="carousel" mode="out-in">
          <NuxtImg
            :key="activeImage"
            :src="activeImage"
            class="w-full h-auto block max-h-[700px] object-contain"
          />
        </Transition>

        <!-- Flechas de navegación -->
        <template v-if="images.length > 1">
          <button
            class="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
            @click="prev"
          >
            <UIcon name="i-heroicons-chevron-left-20-solid" class="w-5 h-5 text-gray-800" />
          </button>
          <button
            class="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
            @click="next"
          >
            <UIcon name="i-heroicons-chevron-right-20-solid" class="w-5 h-5 text-gray-800" />
          </button>

          <!-- Indicador de posición -->
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            <button
              v-for="(_, i) in images"
              :key="i"
              class="w-2 h-2 rounded-full transition-all"
              :class="i === activeIndex ? 'bg-white scale-125' : 'bg-white/50'"
              @click="activeIndex = i"
            />
          </div>
        </template>
      </div>

      <!-- Miniaturas horizontales -->
      <div v-if="images.length > 1" class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          v-for="(img, i) in images"
          :key="i"
          class="shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all"
          :class="i === activeIndex ? 'border-primary shadow-md' : 'border-transparent opacity-60 hover:opacity-100'"
          @click="activeIndex = i"
        >
          <NuxtImg :src="img" class="w-full h-full object-cover" />
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.carousel-enter-active,
.carousel-leave-active {
  transition: opacity 0.25s ease;
}
.carousel-enter-from,
.carousel-leave-to {
  opacity: 0;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
