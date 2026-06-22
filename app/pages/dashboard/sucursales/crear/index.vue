<script setup lang="ts">
definePageMeta({ middleware: "auth", layout: "dashboard" });

const { create, getAll } = useSucursales();
const router = useRouter();

const form = ref({
  nombre: "",
  codigo_establecimiento: undefined as number | undefined,
  punto_emision: undefined as number | undefined,
  secuencia_factura: undefined as number | undefined,
  secuencia_anulacion: undefined as number | undefined,
  ambiente: undefined as "DEV" | "PROD" | undefined,
});

const loading = ref(false);
const nombreError = ref("");

async function handleSubmit() {
  nombreError.value = "";

  if (!form.value.nombre.trim() || !form.value.ambiente) {
    return;
  }

  loading.value = true;
  try {
    const existentes = await getAll();
    const nombreDuplicado = existentes.some(
      (s) => s.nombre.trim().toLowerCase() === form.value.nombre.trim().toLowerCase(),
    );
    if (nombreDuplicado) {
      nombreError.value = "Ya existe una sucursal con ese nombre";
      return;
    }

    await create(form.value as any);
    await router.push("/dashboard/sucursales");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="p-6">
    <div class="mb-6 flex items-center gap-3">
      <UButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        to="/dashboard/sucursales"
      />
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Nueva sucursal</h1>
        <p class="mt-0.5 text-sm text-gray-500">
          Completa los campos de facturación del establecimiento
        </p>
      </div>
    </div>

    <UCard class="max-w-3xl">
      <SucursalesSucursalForm v-model="form" :loading="loading" :nombre-error="nombreError">
        <template #actions>
          <UButton variant="ghost" color="neutral" to="/dashboard/sucursales">
            Cancelar
          </UButton>
          <UButton :loading="loading" icon="i-lucide-save" @click="handleSubmit">
            Crear sucursal
          </UButton>
        </template>
      </SucursalesSucursalForm>
    </UCard>
  </div>
</template>
