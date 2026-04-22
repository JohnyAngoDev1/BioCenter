<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useCart } from '~/composables/useCart'
import { useRouter } from '#app'

// Manejador del paso actual (1 = Resumen, 2 = Dirección, 3 = Pago)
const currentStep = ref(1)

const { cart, cartTotal, cartCount, updateQuantity, removeFromCart } = useCart()
const router = useRouter()

// Datos Simulados
const provincias = ['Guayas', 'Pichincha', 'Azuay']
const cantones = ['Guayaquil', 'Samborondón', 'Daule', 'Quito', 'Cuenca']
const parroquias = ['Tarqui', 'Pascuales', 'Ximena', 'Letamendi']

const form = ref({
  firstName: '',
  lastName: '',
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

// Persistencia
onMounted(() => {
  const savedStep = localStorage.getItem('bio_checkout_step')
  if (savedStep) {
    const stepVal = parseInt(savedStep, 10)
    // Solo restauramos el paso si el carrito NO esta vacio para evitar saltos raros
    if (stepVal > 1 && cartCount.value > 0) {
      currentStep.value = stepVal
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
})

watch(currentStep, (newStep) => {
  localStorage.setItem('bio_checkout_step', newStep.toString())
})

watch(form, (newForm) => {
  localStorage.setItem('bio_checkout_form', JSON.stringify(newForm))
}, { deep: true })

const isProcessing = ref(false)

const handlePayment = () => {
  if (cartCount.value === 0) return
  
  isProcessing.value = true
  // Simulando procesamiento con PayPhone
  setTimeout(() => {
    isProcessing.value = false
    router.push('/checkout/success')
  }, 2500)
}

// Prevenir que se queden en un step avanzado si vacian el carrito a 0 manualmente
watch(cartCount, (newCount) => {
  if (newCount === 0 && currentStep.value > 1) {
    currentStep.value = 1
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
              
              <!-- Información Personal (Comentado temporalmente) -->
              <!-- 
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
                  <UFormField name="phone" label="Teléfono / WhatsApp" required class="md:col-span-2">
                    <UInput v-model="form.phone" type="tel" placeholder="099xxxxxxx" variant="soft" size="lg" class="w-full" />
                  </UFormField>
                </div>
              </UCard>
              -->

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
                    <USelect v-model="form.provincia" :options="provincias" placeholder="Selecciona provincia" variant="soft" size="lg" class="w-full" />
                  </UFormField>
                  <UFormField name="canton" label="Cantón" required>
                    <USelect v-model="form.canton" :options="cantones" placeholder="Selecciona cantón" variant="soft" size="lg" class="w-full" />
                  </UFormField>
                  <UFormField name="parroquia" label="Parroquia" required class="md:col-span-2">
                    <USelect v-model="form.parroquia" :options="parroquias" placeholder="Selecciona parroquia (Opcional)" variant="soft" size="lg" class="w-full" />
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
                          <MapPicker :is-compact="true" />
                        </ClientOnly>
                        
                        <!-- Overlay de Información y Acción -->
                        <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between rounded-b-2xl pointer-events-none">
                          <div class="flex items-center gap-2 text-white pb-1">
                            <UIcon name="i-heroicons-check-badge-solid" class="text-green-400 text-xl" />
                            <span class="text-xs font-black uppercase tracking-widest">Ubicación Fijada</span>
                          </div>
                          <UButton 
                            color="white" 
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
                        <MapPicker :is-compact="false" @confirm="handleMapConfirm" />
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
                  <!-- Billeton Payphone Nativo -->
                  <button
                    :disabled="isProcessing"
                    @click="handlePayment"
                    class="w-full relative overflow-hidden group flex items-center justify-center gap-3 rounded-[2rem] py-5 text-lg font-black tracking-tight shadow-2xl shadow-orange-500/30 text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1"
                    style="background: linear-gradient(90deg, #fb923c, #ea580c);"
                  >
                    <!-- Animacion Shine (Luz que pasa) -->
                    <div class="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 opacity-20 group-hover:animate-[shine_1s]" style="background: linear-gradient(to right, transparent, white);"></div>
                    
                    <template v-if="!isProcessing">
                      <UIcon name="i-heroicons-credit-card-solid" class="w-7 h-7" />
                      Pagar ${{ cartTotal.toFixed(2) }}
                    </template>
                    <template v-else>
                      <UIcon name="i-heroicons-arrow-path-20-solid" class="w-6 h-6 animate-spin" />
                      Aprobando transacción...
                    </template>
                  </button>
                  <div class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-bold text-gray-400 bg-gray-50 rounded-xl p-3 border border-gray-100">
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
