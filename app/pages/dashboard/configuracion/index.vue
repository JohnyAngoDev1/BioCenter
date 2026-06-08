<script setup lang="ts">
import axios from 'axios'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const toast = useToast()
const isSaving = ref(false)

const { data: buttonConfig, refresh } = await useFetch('/api/config/button')
const selectedColor = ref((buttonConfig.value as any)?.buy_button_color || '#269144')
</script>

<template>
  <div class="p-6 max-w-xl">
    <h1 class="text-2xl font-bold text-gray-900 mb-1">Configuración</h1>
    <p class="text-sm text-gray-500 mb-8">Personaliza la apariencia del sitio.</p>

    <UCard class="rounded-2xl">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <UIcon name="i-lucide-paintbrush" class="text-primary text-xl" />
          </div>
          <div>
            <h3 class="font-black text-base text-black">Color del botón "Comprar ahora"</h3>
            <p class="text-xs text-gray-500">Se aplica en la página de cada servicio.</p>
          </div>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Color picker + input hex -->
        <div class="flex items-center gap-4">
          <input
            v-model="selectedColor"
            type="color"
            class="w-14 h-14 rounded-xl border border-gray-200 cursor-pointer p-1"
          />
          <div class="flex-1">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Código hex</label>
            <UInput v-model="selectedColor" placeholder="#269144" variant="soft" size="lg" class="w-full font-mono" />
          </div>
        </div>

        <!-- Preview del botón -->
        <div>
          <label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Vista previa</label>
          <button
            class="w-full py-4 rounded-2xl font-black text-white text-base shadow-xl transition-all"
            :style="{ backgroundColor: selectedColor, boxShadow: `0 10px 30px ${selectedColor}40` }"
          >
            Comprar ahora 🛒
          </button>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton
            size="lg"
            color="primary"
            class="rounded-full px-8 font-black"
            :loading="isSaving"
            @click="async () => {
              isSaving = true
              try {
                await axios.put('/api/config/button', { buy_button_color: selectedColor })
                await refresh()
                toast.add({ title: '¡Guardado!', description: 'El color del botón fue actualizado.', icon: 'i-heroicons-check-circle', color: 'success' })
              } catch {
                toast.add({ title: 'Error', description: 'No se pudo guardar el color.', icon: 'i-heroicons-exclamation-triangle', color: 'error' })
              } finally {
                isSaving = false
              }
            }"
          >
            Guardar cambios
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
