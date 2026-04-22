<script setup lang="ts">
import { ref } from 'vue'
import { useTemplate } from '~/composables/useTemplate'

const { t } = useTemplate()

// API Test logic
const isProcessing = ref(false)
const apiResponse = ref<any>(null)

const testPrepareApi = async () => {
  isProcessing.value = true
  apiResponse.value = 'Procesando...'
  
  const payload = {
    source_module: 'store',
    full_name: 'Johnny Ango',
    document_number: '1723456789',
    email: 'cliente@mail.com',
    phoneNumber: '+593999999999',
    main_street: 'Av. Interoceánica',
    secondary_street: 'Calle 10',
    house_number: 'N10-25',
    city: 'Quito',
    state: 'Pichincha',
    postalCode: '170101',
    customerId: 'cli-001',
    items: [
      {
        kind: 'service',
        product_name: 'sku-001',
        name_snapshot: 'Servicio demo',
        quantity: 1,
        unit_price: 100,
        total_price: 100
      }
    ],
    subtotal: 100,
    iva: 15,
    reference: 'Pago orden 1001'
  }

  console.log('--- INICIANDO PETICIÓN API PREPARE ---')
  console.log('URL:', 'https://5iedvg3cah.execute-api.us-east-1.amazonaws.com/prod/prepare')
  console.log('Payload:', JSON.stringify(payload, null, 2))

  try {
    const response = await fetch('https://5iedvg3cah.execute-api.us-east-1.amazonaws.com/prod/prepare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    console.log('Status Code:', response.status)
    console.log('Status Text:', response.statusText)

    const data = await response.json()
    apiResponse.value = data
    console.log('Respuesta Exitosa (Data):', JSON.stringify(data, null, 2))
    console.log('--- FIN DE PETICIÓN ---')
  } catch (error: any) {
    apiResponse.value = { error: error.message }
    console.error('--- ERROR EN PETICIÓN ---')
    console.error('Mensaje de Error:', error.message)
    console.error('Error Detallado:', error)
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
    <UPageSection class="bg-secondary relative overflow-hidden" :ui="{ wrapper: 'py-12 sm:py-24' }">
        <!-- Background decorative element -->
        <div class="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2"></div>
        
        <UContainer>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">

                <div class="flex flex-col justify-center gap-10 py-4 order-1 lg:order-1">

                    <div class="space-y-8">
                        <div class="space-y-4">
                            <span class="text-primary font-black uppercase tracking-[0.3em] text-xs">
                                {{ t('landing_hero_badge_text') }}
                            </span>
                            <h1 class="text-4xl sm:text-5xl lg:text-7xl font-black text-black tracking-tighter leading-[0.9] sm:leading-[0.85]">
                                {{ t('landing_hero_title_main') }}<br>
                                <span class="text-primary italic">{{ t('landing_hero_title_highlight') }}</span>
                            </h1>
                        </div>

                        <p class="text-gray-500 text-base sm:text-xl leading-relaxed max-w-lg">
                            {{ t('landing_hero_description') }}
                        </p>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-4 items-start">
                        <UButton :label="t('landing_secondary_button_text')" variant="solid"
                            class="rounded-full px-10 py-5 bg-primary text-white font-bold text-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-all"
                            to="#servicios" />
                        
                        <div class="flex items-center gap-4 py-2 px-4">
                            <div class="flex -space-x-3">
                                <div class="w-10 h-10 rounded-full bg-[#f1f5f9] border-2 border-white shadow-sm overflow-hidden">
                                    <NuxtImg src="/images/services/suero_beauty.png" class="w-full h-full object-cover" />
                                </div>
                                <div class="w-10 h-10 rounded-full bg-[#F7F7F7] border-2 border-white shadow-sm overflow-hidden">
                                    <NuxtImg src="/images/services/suero_detox.png" class="w-full h-full object-cover" />
                                </div>
                                <div class="w-10 h-10 rounded-full bg-primary border-2 border-white shadow-sm overflow-hidden text-white flex items-center justify-center text-[10px] font-bold">
                                    +50
                                </div>
                            </div>
                            <p class="text-gray-500 text-xs font-bold uppercase tracking-wider">
                                {{ t('landing_trust_badge_text') }}
                            </p>
                        </div>
                    </div>

                    <!-- DEBUG API BUTTON -->
                    <div class="mt-4 pt-4 border-t border-gray-200/50">
                        <UButton 
                          @click="testPrepareApi" 
                          color="neutral" 
                          variant="ghost" 
                          class="rounded-2xl py-3 font-bold border border-gray-200"
                          :loading="isProcessing && apiResponse === 'Procesando...'"
                        >
                          <template #leading>
                            <UIcon name="i-heroicons-beaker-solid" class="text-primary" />
                          </template>
                          Probar API Prepare
                        </UButton>
                        
                        <div v-if="apiResponse" class="mt-4 text-left">
                          <p class="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest pl-1">Respuesta del Servidor:</p>
                          <pre class="p-4 bg-gray-900 text-green-400 text-[10px] rounded-xl overflow-auto max-h-40 border border-white/10 shadow-inner mono">{{ JSON.stringify(apiResponse, null, 2) }}</pre>
                        </div>
                    </div>

                </div>

                <div class="relative order-2 lg:order-2 flex justify-center">
                    <div class="absolute inset-0 max-w-md mx-auto bg-primary/10 rounded-[3rem] rotate-3 translate-x-4 translate-y-4"></div>
                    <NuxtImg :src="t('landing_hero_image_path')" class="relative z-10 w-full max-w-md h-auto rounded-[3rem] shadow-2xl border-4 border-white" />
                </div>
            </div>
        </UContainer>
    </UPageSection>
</template>