<script setup lang="ts">
import axios from 'axios'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

interface EmpresaConfig {
  ruc: string
  razon_social: string
  nombre_comercial: string
  direccion_matriz: string
  email: string
  telefono: string
  logo: string
  requiere_facturacion: boolean
  buy_button_color: string
}

const toast = useToast()
const { uploadImage } = useS3Upload()

const { data: empresaData, refresh } = await useFetch<EmpresaConfig>('/api/config/empresa')

const form = ref({
  ruc: empresaData.value?.ruc ?? '',
  razon_social: empresaData.value?.razon_social ?? '',
  nombre_comercial: empresaData.value?.nombre_comercial ?? '',
  direccion_matriz: empresaData.value?.direccion_matriz ?? '',
  email: empresaData.value?.email ?? '',
  telefono: empresaData.value?.telefono ?? '',
  requiere_facturacion: empresaData.value?.requiere_facturacion ?? false,
})

const logoUrl = ref(empresaData.value?.logo ?? '')
const logoFile = ref<File | null>(null)
const logoPreview = computed(() => logoFile.value ? URL.createObjectURL(logoFile.value) : logoUrl.value)

function onLogoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) logoFile.value = file
}

const claveCertificado = ref('')
const showClave = ref(false)
const certificadoFile = ref<File | null>(null)
const certificadoInput = ref<HTMLInputElement | null>(null)

function onCertificadoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.name.toLowerCase().endsWith('.p12')) {
    toast.add({ title: 'Archivo inválido', description: 'El certificado debe tener extensión .p12', icon: 'i-heroicons-exclamation-triangle', color: 'error' })
    if (certificadoInput.value) certificadoInput.value.value = ''
    return
  }
  certificadoFile.value = file
}

const isSaving = ref(false)

async function handleSubmit() {
  isSaving.value = true
  try {
    const payload: Record<string, any> = { ...form.value }

    if (logoFile.value) {
      payload.logo = await uploadImage(logoFile.value, 'biocenter/empresa')
    }

    if (certificadoFile.value || claveCertificado.value) {
      if (!certificadoFile.value || !claveCertificado.value) {
        toast.add({ title: 'Faltan datos', description: 'Carga el archivo .p12 e ingresa su clave.', icon: 'i-heroicons-exclamation-triangle', color: 'error' })
        return
      }
      payload.archivo_certificado = await uploadImage(certificadoFile.value, 'biocenter/certificados')
      payload.clave_certificado = claveCertificado.value
    }

    await axios.put('/api/config/empresa', payload)
    await refresh()
    toast.add({ title: '¡Guardado!', description: 'La información de la empresa fue actualizada.', icon: 'i-heroicons-check-circle', color: 'success' })

    logoFile.value = null
    certificadoFile.value = null
    claveCertificado.value = ''
    if (certificadoInput.value) certificadoInput.value.value = ''
  } catch {
    toast.add({ title: 'Error', description: 'No se pudo guardar la información.', icon: 'i-heroicons-exclamation-triangle', color: 'error' })
  } finally {
    isSaving.value = false
  }
}

const isSavingColor = ref(false)
const selectedColor = ref(empresaData.value?.buy_button_color ?? '#269144')

async function saveColor() {
  isSavingColor.value = true
  try {
    await axios.put('/api/config/button', { buy_button_color: selectedColor.value })
    await refresh()
    toast.add({ title: '¡Guardado!', description: 'El color del botón fue actualizado.', icon: 'i-heroicons-check-circle', color: 'success' })
  } catch {
    toast.add({ title: 'Error', description: 'No se pudo guardar el color.', icon: 'i-heroicons-exclamation-triangle', color: 'error' })
  } finally {
    isSavingColor.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-4xl">
    <h1 class="text-2xl font-bold text-gray-900 mb-1">Configuración</h1>
    <p class="text-sm text-gray-500 mb-8">Datos de la empresa y facturación electrónica.</p>

    <UCard class="rounded-2xl">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <UIcon name="i-lucide-building" class="text-primary text-xl" />
          </div>
          <div>
            <h3 class="font-black text-base text-black">Información General</h3>
            <p class="text-xs text-gray-500">Datos de la empresa y certificado de firma electrónica.</p>
          </div>
        </div>
      </template>

      <div class="space-y-5">
        <!-- Logo -->
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
            <img v-if="logoPreview" :src="logoPreview" class="w-full h-full object-cover" />
            <UIcon v-else name="i-lucide-user" class="size-7 text-gray-400" />
          </div>
          <div class="flex-1">
            <label class="flex items-center gap-2 h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 cursor-pointer w-fit">
              <UIcon name="i-lucide-image" class="size-4 text-gray-400" />
              <span class="text-sm font-bold text-primary">Cargar Imagen</span>
              <input type="file" accept="image/png,image/jpeg" class="hidden" @change="onLogoChange" />
            </label>
            <p class="text-xs text-gray-400 mt-1">Tamaño máximo 100 KB · Extensión .jpg o .png</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="RUC">
            <UInput v-model="form.ruc" placeholder="Ej: 0504187303" variant="soft" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Razón Social">
            <UInput v-model="form.razon_social" placeholder="Razón social" variant="soft" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Nombre Comercial">
            <UInput v-model="form.nombre_comercial" placeholder="Nombre comercial" variant="soft" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Dirección Matriz">
            <UInput v-model="form.direccion_matriz" placeholder="Dirección matriz" variant="soft" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Correo Electrónico">
            <UInput v-model="form.email" type="email" placeholder="correo@ejemplo.com" variant="soft" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Teléfono">
            <UInput v-model="form.telefono" placeholder="099xxxxxxx" variant="soft" size="lg" class="w-full" />
          </UFormField>

          <UFormField label="Clave Certificado">
            <UInput
              v-model="claveCertificado"
              :type="showClave ? 'text' : 'password'"
              placeholder="Clave del certificado"
              variant="soft"
              size="lg"
              class="w-full"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="ghost"
                  :icon="showClave ? 'i-heroicons-eye-slash-20-solid' : 'i-heroicons-eye-20-solid'"
                  :padded="false"
                  @click="showClave = !showClave"
                />
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Cargar Certificado (.p12)">
            <div class="flex items-center gap-2 h-11 rounded-lg border border-gray-200 bg-gray-50 px-3">
              <UIcon name="i-lucide-paperclip" class="size-4 text-gray-400 shrink-0" />
              <label class="shrink-0 cursor-pointer text-sm font-bold text-primary hover:underline">
                Seleccionar archivo
                <input ref="certificadoInput" type="file" accept=".p12" class="hidden" @change="onCertificadoChange" />
              </label>
              <span class="truncate text-sm text-gray-500">
                {{ certificadoFile?.name ?? 'Ningún archivo seleccionado' }}
              </span>
            </div>
          </UFormField>
        </div>

        <div class="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div>
            <p class="text-sm font-semibold text-gray-800">Requiere Factura</p>
            <p class="text-xs text-gray-500">Genera comprobante electrónico en cada venta</p>
          </div>
          <USwitch v-model="form.requiere_facturacion" />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton size="lg" color="primary" class="rounded-full px-8 font-black" :loading="isSaving" @click="handleSubmit">
            Guardar cambios
          </UButton>
        </div>
      </template>
    </UCard>

    <UCard class="rounded-2xl mt-6">
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
        <div class="flex items-center gap-4">
          <input v-model="selectedColor" type="color" class="w-14 h-14 rounded-xl border border-gray-200 cursor-pointer p-1" />
          <div class="flex-1">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Código hex</label>
            <UInput v-model="selectedColor" placeholder="#269144" variant="soft" size="lg" class="w-full font-mono" />
          </div>
        </div>

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
          <UButton size="lg" color="primary" class="rounded-full px-8 font-black" :loading="isSavingColor" @click="saveColor">
            Guardar cambios
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
