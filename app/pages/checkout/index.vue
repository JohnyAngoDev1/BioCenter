<script setup lang="ts">
import axios from 'axios'
import { ref, watch, onMounted, nextTick } from '#imports'
import { useCart } from '~/composables/useCart'

const config = useRuntimeConfig()
const currentStep = ref(1)

const { cart, cartTotal, cartCount, updateQuantity, removeFromCart } = useCart()

type LocationOption = { label: string; value: string }

const provincias = ref<LocationOption[]>([])
const cantones = ref<LocationOption[]>([])
const parroquias = ref<LocationOption[]>([])
const loadingProvincias = ref(false)
const loadingCantones = ref(false)
const loadingParroquias = ref(false)

const getProvincias = async () => {
  loadingProvincias.value = true
  try {
    const { data } = await axios.get('/api/location/provincias')
    provincias.value = data
  } catch (e) {
    console.error('Error cargando provincias', e)
  } finally {
    loadingProvincias.value = false
  }
}

const getCantones = async (provinciaId: string) => {
  cantones.value = []
  parroquias.value = []
  if (!provinciaId) return
  loadingCantones.value = true
  try {
    const { data } = await axios.post('/api/location/cantones', { sub_1: provinciaId })
    cantones.value = data
  } catch (e) {
    console.error('Error cargando cantones', e)
  } finally {
    loadingCantones.value = false
  }
}

const getParroquias = async (cantonId: string) => {
  parroquias.value = []
  if (!cantonId) return
  loadingParroquias.value = true
  try {
    const { data } = await axios.post('/api/location/parroquias', { sub_2: cantonId })
    parroquias.value = data
  } catch (e) {
    console.error('Error cargando parroquias', e)
  } finally {
    loadingParroquias.value = false
  }
}

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  documentNumber: '',
  phone: '',
  provincia: '',
  canton: '',
  parroquia: '',
  callePrincipal: '',
  calleSecundaria: '',
  referencia: '',
  lat: null as number | null,
  lng: null as number | null
})

const isEditingMap = ref(false)

const handleMapConfirm = (coords: { lat: number, lng: number }) => {
  form.value.lat = coords.lat
  form.value.lng = coords.lng
  isEditingMap.value = false
}

// Evita que los watches de cascade reseteen los valores al restaurar el form
const isRestoringForm = ref(true)
const userCancelled = ref(false)

onMounted(async () => {
  const route = useRoute()
  
  if (route.query.status === 'cancel') {
    // Si viene de una cancelación, nos quedamos en el paso 3 pero mostramos el error
    // y evitamos la redirección automática inmediata para que el usuario pueda darle a "Reintentar"
    currentStep.value = 3
    userCancelled.value = true
    payphoneError.value = 'El pago no pudo ser procesado o fue cancelado. ¿Deseas intentarlo de nuevo?'
    localStorage.setItem('bio_checkout_step', '3')
  } else {
    const savedStep = localStorage.getItem('bio_checkout_step')
    if (savedStep) {
      const stepVal = parseInt(savedStep, 10)
      if (stepVal > 1 && cartCount.value > 0) {
        currentStep.value = stepVal
      }
    }
  }
  const savedForm = localStorage.getItem('bio_checkout_form')
  if (savedForm) {
    try {
      form.value = { ...form.value, ...JSON.parse(savedForm) }
    } catch (e) {
      console.error('Error loading checkout form from localStorage', e)
    }
  }

  await getProvincias()

  // Restaura la cadena provincia → canton → parroquia si el form tenía valores guardados
  if (form.value.provincia) {
    await getCantones(form.value.provincia)
    if (form.value.canton) {
      await getParroquias(form.value.canton)
    }
  }

  isRestoringForm.value = false
})

watch(currentStep, (newStep) => {
  localStorage.setItem('bio_checkout_step', newStep.toString())
})

watch(form, (newForm) => {
  localStorage.setItem('bio_checkout_form', JSON.stringify(newForm))
}, { deep: true })

watch(cartCount, (newCount) => {
  if (newCount === 0 && currentStep.value > 1) {
    currentStep.value = 1
  }
})

watch(() => form.value.provincia, async (id: string) => {
  if (isRestoringForm.value) return
  form.value.canton = ''
  form.value.parroquia = ''
  await getCantones(id)
})

watch(() => form.value.canton, async (id: string) => {
  if (isRestoringForm.value) return
  form.value.parroquia = ''
  await getParroquias(id)
})

// ── Payphone ──────────────────────────────────────────────────────────────────

const isProcessing = ref(false)
const payphoneError = ref('')

const formatPhone = (phone: string) => {
  if (!phone) return '+593999999999'
  let clean = phone.replace(/\D/g, '')
  // Si tiene 10 dígitos y empieza con 0 (ej: 0995254897), quitamos el 0
  if (clean.length === 10 && clean.startsWith('0')) clean = clean.slice(1)
  // Si ya tiene el 593 al principio (ej: 593995254897), quitamos el 593 para dejar solo los 9 dígitos
  if (clean.startsWith('593')) clean = clean.slice(3)
  
  return `+593${clean}`
}

const loadPayphoneAssets = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if ((window as any).PPaymentButtonBox) { resolve(); return }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar el script de Payphone'))
    document.head.appendChild(script)
  })

const handlePaymentPreparation = async () => {
  if (cartCount.value === 0) return

  isProcessing.value = true
  payphoneError.value = ''

  try {
    // Eliminamos el hack del centavo y usamos los valores reales
    const subtotal = cartTotal.value
    const iva = 0 // El Proxy de AWS ya calcula el IVA automáticamente

    const items = cart.value.map((item) => {
      const quantity = Number(item.quantity || 1)
      const unitPrice = Number(item.price || 0)
      
      return {
        kind: 'service',
        product_name: item.id || 'service',
        name_snapshot: item.title,
        quantity: quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity
      }
    })

    const provinciaLabel = provincias.value.find(p => p.value === form.value.provincia)?.label || 'Pichincha'
    const cantonLabel = cantones.value.find(c => c.value === form.value.canton)?.label || 'Quito'

    const { data } = await axios.post('/api/prepare-payment', {
      source_module: 'store',
      full_name: `${form.value.firstName} ${form.value.lastName}`.trim() || 'Cliente BioCenter',
      document_number: form.value.documentNumber || '1700000000',
      email: form.value.email,
      phoneNumber: formatPhone(form.value.phone),
      main_street: form.value.callePrincipal || 'Av. Principal',
      secondary_street: form.value.calleSecundaria || 'S/N',
      house_number: '000', // Podrías añadir un campo si fuera necesario
      city: cantonLabel,
      state: provinciaLabel,
      postalCode: '170101',
      customerId: form.value.email,
      lat: form.value.lat,
      lng: form.value.lng,
      items: items,
      subtotal: subtotal,
      iva: iva,
      reference: `Pedido BioCenter - ${form.value.lastName}`
    })

    const totalCentavos = Math.round((subtotal + iva) * 100)
    
    await loadPayphoneAssets()
    await nextTick()

    // Limpiar instancia anterior si el usuario regresa al step 3
    const container = document.getElementById('pp-button')
    if (container) container.innerHTML = ''

    if (data.status && data.payWithCard) {
      // REDIRECCIÓN AUTOMÁTICA AL LINK DE PAGO
      // Esto evita los problemas de autorización del SDK y es más rápido
      window.location.href = data.payWithCard
    } else if (data.status) {
      mountPayphoneSDK(data)
    } else {
      const detail = data.details?.error?.errors?.[0]?.errorDescriptions?.[0] || data.details?.message || 'Error en la preparación'
      payphoneError.value = `Error: ${detail}`
      isProcessing.value = false
    }
  } catch (err: any) {
    payphoneError.value = err.response?.data?.message ?? 'Error al preparar el pago. Intenta nuevamente.'
    console.error('[Payphone]', err)
  } finally {
    isProcessing.value = false
  }
}

const mountPayphoneSDK = (data: any) => {
  try {
    const container = document.getElementById('pp-button')
    if (container) container.innerHTML = ''

    const config = useRuntimeConfig()
    // @ts-ignore
    const pbox = new (window as any).PPaymentButtonBox({
      token: data.token || data.paymentId,
      storeId: config.public.payphoneStoreId
    })
    
    pbox.render('pp-button')

  } catch (err: any) {
    console.error('[Payphone SDK Error]', err)
    payphoneError.value = 'Error al inicializar el botón de pago.'
  } finally {
    isProcessing.value = false
  }
}

watch(currentStep, async (step) => {
  // Solo preparamos el pago automáticamente si NO venimos de una cancelación reciente
  if (step === 3) {
    if (userCancelled.value) {
      // Reseteamos el flag para que, si el usuario vuelve a entrar manualmente a este paso, sí se dispare
      userCancelled.value = false
    } else {
      await handlePaymentPreparation()
    }
  }
})
</script>

<template>
  <div class="py-12 bg-[#F9FAFB] min-h-screen">
    <UContainer>
      
      <!-- Si vaciaron sus cosas y llegan a 0 -->
      <div v-if="cart.length === 0" class="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
        <UIcon name="i-heroicons-shopping-cart-20-solid" class="text-6xl text-gray-300 mb-4" />
        <h2 class="text-2xl font-black text-black tracking-tight mb-2">Tu carrito está vacío</h2>
        <p class="text-gray-500 mb-8">Agrega algunos productos antes de proceder al pago.</p>
        <UButton to="/servicios" color="primary" size="xl" class="rounded-full px-8 font-bold">
          Explorar Servicios
        </UButton>
      </div>

      <!-- Sistema Activo -->
      <div v-else class="flex flex-col lg:flex-row gap-8 items-start">
        
        <!-- COLUMNA IZQUIERDA: Formularios / Wizard -->
        <div class="w-full lg:w-2/3 space-y-6">
          
          <!-- Titulo -->
          <div class="mb-2">
            <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-4 font-medium transition-colors">
              <UIcon name="i-heroicons-arrow-left-20-solid" />
              Volver a la tienda
            </NuxtLink>
            <h1 class="text-3xl font-black text-black tracking-tight">Finalizar Compra</h1>
          </div>

          <!-- STEPPER INDICATOR (PROGRESS BAR) -->
          <div class="flex items-center gap-2 mb-8 select-none bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
            <!-- Circulo 1 -->
            <div class="flex items-center gap-2 transition-colors duration-300" :class="currentStep >= 1 ? 'text-primary' : 'text-gray-400'">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 shadow-sm" :class="currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'">1</div>
              <span class="font-bold text-xs sm:text-sm hidden sm:block">Resumen</span>
            </div>
            
            <!-- Linea Recta -->
            <div class="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden mx-1 sm:mx-4">
              <div class="h-full bg-primary transition-all duration-700 ease-in-out" :style="`width: ${currentStep >= 2 ? '100%' : '0%'}`"></div>
            </div>

            <!-- Circulo 2 -->
            <div class="flex items-center gap-2 transition-colors duration-300" :class="currentStep >= 2 ? 'text-primary' : 'text-gray-400'">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 shadow-sm delay-200" :class="currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'">2</div>
              <span class="font-bold text-xs sm:text-sm hidden sm:block">Envío</span>
            </div>
            
            <!-- Linea Recta -->
            <div class="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden mx-1 sm:mx-4">
              <div class="h-full bg-primary transition-all duration-700 ease-in-out" :style="`width: ${currentStep >= 3 ? '100%' : '0%'}`"></div>
            </div>

            <!-- Circulo 3 -->
            <div class="flex items-center gap-2 transition-colors duration-300" :class="currentStep >= 3 ? 'text-primary' : 'text-gray-400'">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 shadow-sm delay-200" :class="currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'">3</div>
              <span class="font-bold text-xs sm:text-sm hidden sm:block">Pago</span>
            </div>
          </div>

          <!-- ============================================== -->
          <!-- BLOCK STEP 1: DETALLE DE LOS PRODUCTOS ======= -->
          <!-- ============================================== -->
          <div v-show="currentStep === 1" class="animate-[fade-in_0.4s_ease-out]">
            <UCard class="rounded-2xl shadow-sm border border-gray-100">
              <template #header>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UIcon name="i-heroicons-shopping-bag-20-solid" class="text-primary text-xl" />
                  </div>
                  <div>
                    <h3 class="font-black text-xl text-black">Revisa tu Pedido</h3>
                    <p class="text-xs text-gray-500 mt-1">Asegúrate que las cantidades y sueros sean los correctos.</p>
                  </div>
                </div>
              </template>
              
              <div class="space-y-4">
                <div v-for="item in cart" :key="item.id" class="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all items-center">
                  <div class="w-20 h-20 rounded-lg overflow-hidden shrink-0 shadow-sm border border-black/5 bg-secondary">
                     <NuxtImg :src="item.image" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-black text-base line-clamp-1 group-hover:text-primary transition-colors">{{ item.title }}</h4>
                    <p class="text-primary font-black text-sm mb-3">${{ item.price.toFixed(2) }}</p>
                    
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                        <UButton size="xs" color="neutral" variant="ghost" icon="i-heroicons-minus-20-solid" class="rounded-md hover:bg-gray-100" @click="updateQuantity(item.id, -1)" />
                        <span class="text-xs font-black min-w-[24px] text-center text-gray-700">{{ item.quantity }}</span>
                        <UButton size="xs" color="neutral" variant="ghost" icon="i-heroicons-plus-20-solid" class="rounded-md hover:bg-gray-100" @click="updateQuantity(item.id, 1)" />
                      </div>
                      
                      <div class="text-right">
                         <span class="block text-[10px] text-gray-400 uppercase font-bold tracking-widest">Subtotal</span>
                         <span class="font-black text-black">
                           ${{ (item.price * item.quantity).toFixed(2) }}
                         </span>
                      </div>
                    </div>
                  </div>
                  <!-- Delete button floating right -->
                  <div class="h-full flex flex-col justify-start pl-2 border-l border-gray-200 relative -right-1">
                    <UButton size="sm" color="error" variant="ghost" icon="i-heroicons-trash-20-solid" class="opacity-30 hover:opacity-100 text-red-500" @click="removeFromCart(item.id)" />
                  </div>
                </div>
              </div>

              <!-- Buttons Navigation -->
              <div class="flex justify-end items-center mt-6 pt-6 border-t border-gray-100">
                <UButton size="xl" color="primary" class="rounded-full px-8 shadow-md" @click="currentStep = 2">
                  Ingresar Datos de Envío
                  <template #trailing>
                    <UIcon name="i-heroicons-arrow-right-20-solid" />
                  </template>
                </UButton>
              </div>
            </UCard>
          </div>

          <!-- ============================================== -->
          <!-- BLOCK STEP 2: DIRECCION Y DATOS ============== -->
          <!-- ============================================== -->
          <div v-show="currentStep === 2" class="animate-[fade-in_0.4s_ease-out]">
            <UForm :state="form" @submit="currentStep = 3" class="space-y-6">
              
              <!-- Información Personal -->
              <UCard class="rounded-2xl shadow-sm border border-gray-100">
                <template #header>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UIcon name="i-heroicons-user-20-solid" class="text-primary text-xl" />
                    </div>
                    <h3 class="font-black text-lg text-black">Información Personal</h3>
                  </div>
                </template>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UFormField name="firstName" label="Nombres" required>
                    <UInput v-model="form.firstName" placeholder="Ej: Juan" variant="soft" size="lg" class="w-full" />
                  </UFormField>
                  <UFormField name="lastName" label="Apellidos" required>
                    <UInput v-model="form.lastName" placeholder="Ej: Pérez" variant="soft" size="lg" class="w-full" />
                  </UFormField>
                  <UFormField name="email" label="Correo Electrónico" required>
                    <UInput v-model="form.email" type="email" placeholder="correo@ejemplo.com" variant="soft" size="lg" class="w-full" />
                  </UFormField>
                  <UFormField name="documentNumber" label="Cédula / RUC">
                    <UInput v-model="form.documentNumber" placeholder="Ej: 0912345678" variant="soft" size="lg" class="w-full" />
                  </UFormField>
                  <UFormField name="phone" label="Teléfono / WhatsApp" required class="md:col-span-2">
                    <UInput v-model="form.phone" type="tel" placeholder="099xxxxxxx" variant="soft" size="lg" class="w-full" />
                  </UFormField>
                </div>
              </UCard>

              <!-- Dirección de Entrega -->
              <UCard class="rounded-2xl shadow-sm border border-gray-100">
                <template #header>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <UIcon name="i-heroicons-map-20-solid" class="text-primary text-xl" />
                    </div>
                    <div>
                      <h3 class="font-black text-lg text-black leading-tight">Dirección de Entrega</h3>
                      <p class="text-xs text-gray-500">¿A dónde enviaremos tu pedido?</p>
                    </div>
                  </div>
                </template>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <UFormField name="provincia" label="Provincia" required>
                    <USelect
                      v-model="form.provincia"
                      :items="provincias"
                      value-key="value"
                      label-key="label"
                      :loading="loadingProvincias"
                      placeholder="Selecciona provincia"
                      variant="soft"
                      size="lg"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField name="canton" label="Cantón" required>
                    <USelect
                      v-model="form.canton"
                      :items="cantones"
                      value-key="value"
                      label-key="label"
                      :loading="loadingCantones"
                      :disabled="!form.provincia || loadingCantones"
                      placeholder="Selecciona cantón"
                      variant="soft"
                      size="lg"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField name="parroquia" label="Parroquia" class="md:col-span-2">
                    <USelect
                      v-model="form.parroquia"
                      :items="parroquias"
                      value-key="value"
                      label-key="label"
                      :loading="loadingParroquias"
                      :disabled="!form.canton || loadingParroquias"
                      placeholder="Selecciona parroquia (Opcional)"
                      variant="soft"
                      size="lg"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField name="callePrincipal" label="Calle Principal" required class="md:col-span-2">
                    <UInput v-model="form.callePrincipal" placeholder="Por ej: Av. Nueve de Octubre" variant="soft" size="lg" class="w-full" />
                  </UFormField>
                  <UFormField name="calleSecundaria" label="Calle Secundaria (Opcional)" class="md:col-span-2">
                    <UInput v-model="form.calleSecundaria" placeholder="Por ej: Malecón Simón Bolívar" variant="soft" size="lg" class="w-full" />
                  </UFormField>
                  <UFormField name="referencia" label="Referencia o Detalles" required class="md:col-span-2">
                    <UTextarea v-model="form.referencia" placeholder="Color de casa, edificio, local cercano, piso, número de oficina..." :rows="2" variant="soft" size="lg" class="w-full" />
                  </UFormField>
                </div>

                <!-- Selector del GPS / Mapa (Optimizado UX/UI) -->
                <UFormField name="gps" label="Ubicación de Entrega" class="mt-6 pt-5 border-t border-gray-100">
                  <div class="space-y-4">
                    <!-- CASO 1: YA FIJADO (MODO COMPRIMIDO) -->
                    <div v-if="form.lat && !isEditingMap" class="animate-[fade-in_0.4s_ease-out]">
                      <div class="relative group">
                        <ClientOnly>
                          <MapPicker :is-compact="true" :initial-lat="form.lat || -2.1702" :initial-lng="form.lng || -78.4678" />
                        </ClientOnly>
                        
                        <!-- Overlay de Información y Acción -->
                        <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between rounded-b-2xl pointer-events-none">
                          <div class="flex items-center gap-2 text-white pb-1">
                            <UIcon name="i-heroicons-check-badge-solid" class="text-green-400 text-xl" />
                            <span class="text-xs font-black uppercase tracking-widest">Ubicación Fijada</span>
                          </div>
                          <UButton 
                            color="neutral" 
                            variant="solid" 
                            size="xs" 
                            class="rounded-full px-4 font-black pointer-events-auto shadow-xl"
                            @click="isEditingMap = true"
                          >
                            Editar Punto
                            <template #trailing>
                              <UIcon name="i-heroicons-pencil-square-20-solid" />
                            </template>
                          </UButton>
                        </div>
                      </div>
                      
                      <!-- Banner de Feedback Positivo -->
                      <div class="mt-4 flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl">
                        <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm">
                          <UIcon name="i-heroicons-truck-solid" />
                        </div>
                        <div>
                          <p class="text-xs font-black text-green-800 leading-tight">¡Todo listo!</p>
                          <p class="text-[10px] text-green-600 font-bold uppercase tracking-tight">Tu pedido llegará exactamente a este punto.</p>
                        </div>
                      </div>
                    </div>

                    <!-- CASO 2: NO FIJADO O EDITANDO (MODO COMPLETO) -->
                    <div v-else class="animate-[fade-in_0.4s_ease-out]">
                      <p class="text-xs text-gray-500 mb-4 bg-primary/5 p-3 rounded-xl border border-primary/10 italic">
                        <UIcon name="i-heroicons-information-circle-20-solid" class="inline-block mr-1 text-primary" />
                        Para una entrega ultra-rápida, sitúa el pin esmeralda justo sobre la entrada de tu casa o negocio.
                      </p>
                      <ClientOnly>
                        <MapPicker :is-compact="false" :initial-lat="form.lat || -2.1702" :initial-lng="form.lng || -78.4678" @confirm="handleMapConfirm" />
                      </ClientOnly>
                    </div>
                  </div>
                </UFormField>
              </UCard>
              
              <div class="flex justify-between items-center mt-4 pt-4">
                <UButton variant="ghost" color="neutral" class="rounded-full px-6" size="lg" @click="currentStep = 1">
                  <template #leading>
                    <UIcon name="i-heroicons-arrow-left-20-solid" />
                  </template>
                  Volver al carrito
                </UButton>
                <!-- Boton submit para que UForm actúe -->
                <UButton type="submit" size="xl" color="primary" class="rounded-full px-8 shadow-md">
                  Continuar al Pago
                  <template #trailing>
                    <UIcon name="i-heroicons-arrow-right-20-solid" />
                  </template>
                </UButton>
              </div>
            </UForm>
          </div>

          <!-- ============================================== -->
          <!-- BLOCK STEP 3: EFECTUAR PAGO ================== -->
          <!-- ============================================== -->
          <div v-show="currentStep === 3" class="animate-[fade-in_0.4s_ease-out]">
            <UCard class="rounded-2xl shadow-lg border border-primary/20 bg-gradient-to-b from-white to-orange-50/20">
              <div class="text-center py-10 px-4">
                <div class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white">
                  <UIcon name="i-heroicons-lock-closed-solid" class="text-3xl text-orange-500" />
                </div>
                
                <h3 class="font-black text-2xl text-black mb-2">Pago Seguro con PayPhone</h3>
                <p class="text-gray-500 mb-10 max-w-sm mx-auto">Estas a un paso de completar tu salud. Paga con cualquier tarjeta a través de nuestra pasarela ultra-segura.</p>
                
                <div class="max-w-md mx-auto">
                  <!-- Estado: cargando prepare -->
                  <div v-if="isProcessing" class="flex flex-col items-center gap-4 py-6">
                    <UIcon name="i-heroicons-arrow-path-20-solid" class="w-10 h-10 text-primary animate-spin" />
                    <p class="text-gray-500 font-medium">Preparando tu pago seguro...</p>
                  </div>

                  <!-- Estado: error en prepare -->
                  <div v-else-if="payphoneError" class="flex flex-col items-center gap-4 py-6">
                    <UIcon name="i-heroicons-exclamation-triangle-20-solid" class="w-10 h-10 text-red-400" />
                    <p class="text-red-500 font-bold text-sm">{{ payphoneError }}</p>
                    <UButton color="primary" variant="soft" class="rounded-full px-6" @click="handlePaymentPreparation">
                      Reintentar
                    </UButton>
                  </div>

                  <!-- Contenedor del botón Payphone (PPaymentButtonBox renderiza aquí) -->
                  <div id="pp-button" :class="{ hidden: isProcessing || !!payphoneError }" />

                  <div v-if="!isProcessing && !payphoneError" class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-bold text-gray-400 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <span class="flex items-center gap-1"><UIcon name="i-heroicons-shield-check-solid" class="text-green-500" /> Encriptación 256-bit</span>
                    <span class="text-gray-300 hidden sm:block">|</span>
                    <span class="flex items-center gap-1"><UIcon name="i-heroicons-check-badge-solid" class="text-primary" /> Verified by Visa / MC</span>
                  </div>
                </div>
              </div>
              
              <template #footer>
                <div class="flex justify-start">
                  <UButton variant="ghost" color="neutral" class="rounded-full px-6" @click="currentStep = 2">
                    <template #leading>
                      <UIcon name="i-heroicons-arrow-left-20-solid" />
                    </template>
                    Retroceder y revisar datos
                  </UButton>
                </div>
              </template>
            </UCard>
          </div>

        </div>

        <!-- ============================================== -->
        <!-- COLUMNA DERECHA: MINI SUMMARY FIJO =========== -->
        <!-- ============================================== -->
        <div class="w-full lg:w-1/3">
          <div class="sticky top-24">
            <UCard class="rounded-2xl shadow-2xl shadow-primary/5 border border-primary/10 bg-white/50 backdrop-blur-xl">
              <h3 class="font-black text-xl text-black mb-6 border-b border-black/5 pb-4 flex justify-between items-center">
                <span>Tu Pedido</span>
                <UBadge color="primary" variant="soft" class="font-black">{{ cartCount }} ítems</UBadge>
              </h3>
              
              <!-- Subtotals Mini -->
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 font-medium">Subtotal</span>
                  <span class="font-bold text-black">${{ cartTotal.toFixed(2) }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 font-medium">Descuentos</span>
                  <span class="font-bold text-green-500">$0.00</span>
                </div>
                <div class="flex items-center justify-between text-base">
                  <span class="font-bold text-gray-700">Envío / Courier</span>
                  <span class="font-bold text-black bg-gray-100 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                     <UIcon name="i-heroicons-truck-solid" /> Por cotizar
                  </span>
                </div>
                
                <div class="flex items-center justify-between text-2xl font-black pt-4 mt-2 border-t border-dashed border-gray-200">
                  <span class="text-black">Total</span>
                  <span class="text-primary">${{ cartTotal.toFixed(2) }}</span>
                </div>
              </div>
              
              <p class="text-[10px] text-gray-400 font-medium mt-6 text-center italic">
                Impuestos incluidos. Completa los pasos en la columna principal para proceder.
              </p>
            </UCard>
          </div>
        </div>

      </div>
    </UContainer>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shine {
  100% { left: 125%; }
}
</style>
