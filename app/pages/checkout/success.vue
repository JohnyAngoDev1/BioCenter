<script setup lang="ts">
import { onMounted } from 'vue'
import { useCart } from '~/composables/useCart'

const { clearCart } = useCart()

// Vaciamos el carrito y la persistencia de pasos al entrar a la pantalla de éxito
onMounted(() => {
  clearCart()
  // Limpiamos rastro del proceso de checkout para que no salte al step 3 luego
  localStorage.removeItem('bio_checkout_step')
  localStorage.removeItem('bio_checkout_form')
})
</script>

<template>
  <div class="py-20 bg-[#F9FAFB] min-h-screen flex items-center justify-center">
    <UContainer class="w-full">
      <div class="max-w-2xl mx-auto text-center">
        <!-- Ícono de Éxito animado estático -->
        <div class="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/10 border-4 border-white">
          <UIcon name="i-heroicons-check-badge-solid" class="text-5xl" />
        </div>
        
        <h1 class="text-4xl md:text-5xl font-black text-black tracking-tight mb-4">
          ¡Gracias por tu compra!
        </h1>
        <p class="text-lg text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed">
          Tu pago ha sido procesado exitosamente por PayPhone. Hemos recibido tu orden y comenzaremos a prepararla de inmediato.
        </p>

        <!-- Recibo Ficticio / Detalle -->
        <UCard class="mb-10 text-left relative overflow-hidden rounded-3xl shadow-lg border border-gray-100">
          <!-- Decoración superior estática del ticket -->
          <div class="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary via-emerald-400 to-green-500"></div>
          
          <div class="p-8 sm:p-10">
            <div class="grid grid-cols-2 gap-6 mb-8 text-sm">
              <div>
                <span class="block text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Número de Orden</span>
                <span class="font-black text-lg text-black">#BIO-{{ Math.floor(Math.random() * 9000) + 1000 }}</span>
              </div>
              <div class="text-right">
                <span class="block text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Fecha</span>
                <span class="font-bold text-gray-800">{{ new Date().toLocaleDateString('es-EC') }}</span>
              </div>
              <div class="col-span-2 pt-4 border-t border-dashed border-gray-200">
                <span class="block text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Estado del Pago</span>
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 font-bold text-xs">
                  <UIcon name="i-heroicons-check-circle-20-solid" />
                  Aprobado (PayPhone)
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
              <UIcon name="i-heroicons-clock-20-solid" class="text-3xl text-gray-400 mb-2" />
              <h4 class="font-bold text-black">Próximos pasos</h4>
              <p class="text-sm text-gray-500 mt-2">
                Un asesor de Biocenter se contactará contigo vía WhatsApp o al teléfono registrado para confirmar la entrega.
              </p>
            </div>
          </div>
        </UCard>

        <!-- Botones de Acción -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <UButton
            to="/servicios"
            color="primary"
            size="xl"
            class="rounded-full px-10 py-4 font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
          >
            Seguir Comprando
          </UButton>
          <UButton
            to="/"
            variant="ghost"
            color="neutral"
            size="xl"
            class="rounded-full px-8 py-4 font-bold"
          >
            Volver al Inicio
          </UButton>
        </div>
      </div>
    </UContainer>
  </div>
</template>
